// Database schema for the English Vocabulary Learning Platform
// Using Drizzle ORM with PostgreSQL

import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
  jsonb,
  primaryKey,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vocabulary collections - groups of related words
export const collections = pgTable(
  "collections",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#3B82F6"), // hex color for collection theme
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_collections_user").on(table.userId)]
);

// Individual vocabulary words
export const vocabulary = pgTable(
  "vocabulary",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    word: varchar("word", { length: 255 }).notNull(),
    meaning: text("meaning").notNull(),
    example: text("example"), // optional example sentence
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    collectionId: varchar("collection_id").references(() => collections.id, { onDelete: "set null" }),
    mastered: boolean("mastered").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_vocabulary_user").on(table.userId),
    index("IDX_vocabulary_collection").on(table.collectionId),
  ]
);

// Learning progress tracking per collection
export const progress = pgTable(
  "progress",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
    wordsLearned: integer("words_learned").default(0),
    totalQuizzes: integer("total_quizzes").default(0),
    correctAnswers: integer("correct_answers").default(0),
    lastStudied: timestamp("last_studied"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_progress_user").on(table.userId),
    index("IDX_progress_collection").on(table.collectionId),
  ]
);

// Quiz results for detailed tracking
export const quizResults = pgTable(
  "quiz_results",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    collectionId: varchar("collection_id").references(() => collections.id, { onDelete: "set null" }),
    mode: varchar("mode", { length: 50 }).notNull(), // 'quiz', 'flashcard', 'spelling'
    totalQuestions: integer("total_questions").notNull(),
    correctAnswers: integer("correct_answers").notNull(),
    score: real("score").notNull(), // percentage score
    completedAt: timestamp("completed_at").defaultNow(),
  },
  (table) => [
    index("IDX_quiz_results_user").on(table.userId),
    index("IDX_quiz_results_collection").on(table.collectionId),
  ]
);

// Define relations for easier querying
export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
  vocabulary: many(vocabulary),
  progress: many(progress),
  quizResults: many(quizResults),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  vocabulary: many(vocabulary),
  progress: many(progress),
}));

export const vocabularyRelations = relations(vocabulary, ({ one }) => ({
  user: one(users, {
    fields: [vocabulary.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [vocabulary.collectionId],
    references: [collections.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [progress.collectionId],
    references: [collections.id],
  }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
  collection: one(collections, {
    fields: [quizResults.collectionId],
    references: [collections.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVocabularySchema = createInsertSchema(vocabulary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  completedAt: true,
});

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// API response types for frontend
export type CollectionWithStats = Collection & {
  wordCount: number;
  masteredCount: number;
  progress?: Progress;
};

export type DashboardStats = {
  totalWords: number;
  totalCollections: number;
  wordsLearned: number;
  averageAccuracy: number;
  studyStreak: number;
  recentActivity: QuizResult[];
};

// Import format types for bulk import
export type VocabularyImport = {
  word: string;
  meaning: string;
  example?: string;
};
