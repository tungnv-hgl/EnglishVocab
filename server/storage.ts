// Database storage implementation for VocabMaster
// Using Drizzle ORM with PostgreSQL

import {
  users,
  collections,
  vocabulary,
  progress,
  quizResults,
  type User,
  type UpsertUser,
  type Collection,
  type InsertCollection,
  type Vocabulary,
  type InsertVocabulary,
  type Progress,
  type InsertProgress,
  type QuizResult,
  type InsertQuizResult,
  type CollectionWithStats,
  type DashboardStats,
  type VocabularyImport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;

  // Collection operations
  getCollections(userId: string): Promise<CollectionWithStats[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  getCollectionWithVocabulary(id: string): Promise<(Collection & { vocabulary: Vocabulary[]; wordCount: number; masteredCount: number }) | undefined>;
  createCollection(data: InsertCollection): Promise<Collection>;
  updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;

  // Vocabulary operations
  getVocabulary(userId: string): Promise<(Vocabulary & { collection?: Collection | null })[]>;
  getVocabularyById(id: string): Promise<Vocabulary | undefined>;
  getVocabularyByCollection(collectionId: string): Promise<Vocabulary[]>;
  createVocabulary(data: InsertVocabulary): Promise<Vocabulary>;
  updateVocabulary(id: string, data: Partial<InsertVocabulary>): Promise<Vocabulary | undefined>;
  deleteVocabulary(id: string): Promise<boolean>;
  importVocabulary(userId: string, items: VocabularyImport[], collectionId?: string): Promise<number>;

  // Progress operations
  getProgress(userId: string, collectionId: string): Promise<Progress | undefined>;
  updateProgress(userId: string, collectionId: string, data: Partial<InsertProgress>): Promise<Progress>;

  // Quiz results operations
  saveQuizResult(data: InsertQuizResult): Promise<QuizResult>;
  getRecentQuizResults(userId: string, limit?: number): Promise<QuizResult[]>;

  // Dashboard stats
  getDashboardStats(userId: string): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Collection operations
  async getCollections(userId: string): Promise<CollectionWithStats[]> {
    const userCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.updatedAt));

    const collectionsWithStats: CollectionWithStats[] = [];

    for (const collection of userCollections) {
      const vocab = await db
        .select()
        .from(vocabulary)
        .where(eq(vocabulary.collectionId, collection.id));

      const wordCount = vocab.length;
      const masteredCount = vocab.filter((v) => v.mastered).length;

      const [prog] = await db
        .select()
        .from(progress)
        .where(
          and(
            eq(progress.userId, userId),
            eq(progress.collectionId, collection.id)
          )
        );

      collectionsWithStats.push({
        ...collection,
        wordCount,
        masteredCount,
        progress: prog,
      });
    }

    return collectionsWithStats;
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id));
    return collection;
  }

  async getCollectionWithVocabulary(id: string): Promise<(Collection & { vocabulary: Vocabulary[]; wordCount: number; masteredCount: number }) | undefined> {
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id));

    if (!collection) return undefined;

    const vocab = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.collectionId, id))
      .orderBy(desc(vocabulary.createdAt));

    return {
      ...collection,
      vocabulary: vocab,
      wordCount: vocab.length,
      masteredCount: vocab.filter((v) => v.mastered).length,
    };
  }

  async createCollection(data: InsertCollection): Promise<Collection> {
    const [collection] = await db
      .insert(collections)
      .values(data)
      .returning();
    return collection;
  }

  async updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined> {
    const [collection] = await db
      .update(collections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();
    return collection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await db
      .delete(collections)
      .where(eq(collections.id, id));
    return true;
  }

  // Vocabulary operations
  async getVocabulary(userId: string): Promise<(Vocabulary & { collection?: Collection | null })[]> {
    const vocab = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.userId, userId))
      .orderBy(desc(vocabulary.createdAt));

    const vocabWithCollections = await Promise.all(
      vocab.map(async (v) => {
        if (v.collectionId) {
          const [collection] = await db
            .select()
            .from(collections)
            .where(eq(collections.id, v.collectionId));
          return { ...v, collection };
        }
        return { ...v, collection: null };
      })
    );

    return vocabWithCollections;
  }

  async getVocabularyById(id: string): Promise<Vocabulary | undefined> {
    const [vocab] = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, id));
    return vocab;
  }

  async getVocabularyByCollection(collectionId: string): Promise<Vocabulary[]> {
    return db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.collectionId, collectionId))
      .orderBy(desc(vocabulary.createdAt));
  }

  async createVocabulary(data: InsertVocabulary): Promise<Vocabulary> {
    const [vocab] = await db.insert(vocabulary).values(data).returning();
    return vocab;
  }

  async updateVocabulary(id: string, data: Partial<InsertVocabulary>): Promise<Vocabulary | undefined> {
    const [vocab] = await db
      .update(vocabulary)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vocabulary.id, id))
      .returning();
    return vocab;
  }

  async deleteVocabulary(id: string): Promise<boolean> {
    await db.delete(vocabulary).where(eq(vocabulary.id, id));
    return true;
  }

  async importVocabulary(userId: string, items: VocabularyImport[], collectionId?: string): Promise<number> {
    const values = items.map((item) => ({
      word: item.word,
      meaning: item.meaning,
      example: item.example || null,
      userId,
      collectionId: collectionId || null,
    }));

    await db.insert(vocabulary).values(values);
    return items.length;
  }

  // Progress operations
  async getProgress(userId: string, collectionId: string): Promise<Progress | undefined> {
    const [prog] = await db
      .select()
      .from(progress)
      .where(
        and(eq(progress.userId, userId), eq(progress.collectionId, collectionId))
      );
    return prog;
  }

  async updateProgress(userId: string, collectionId: string, data: Partial<InsertProgress>): Promise<Progress> {
    const existing = await this.getProgress(userId, collectionId);

    if (existing) {
      const [updated] = await db
        .update(progress)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(progress.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(progress)
      .values({
        userId,
        collectionId,
        ...data,
      })
      .returning();
    return created;
  }

  // Quiz results operations
  async saveQuizResult(data: InsertQuizResult): Promise<QuizResult> {
    const [result] = await db.insert(quizResults).values(data).returning();

    // Update progress if collection is specified
    if (data.collectionId) {
      const prog = await this.getProgress(data.userId, data.collectionId);
      await this.updateProgress(data.userId, data.collectionId, {
        totalQuizzes: (prog?.totalQuizzes || 0) + 1,
        correctAnswers: (prog?.correctAnswers || 0) + data.correctAnswers,
        lastStudied: new Date(),
      });
    }

    return result;
  }

  async getRecentQuizResults(userId: string, limit: number = 10): Promise<QuizResult[]> {
    return db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt))
      .limit(limit);
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Total words
    const [wordCount] = await db
      .select({ count: count() })
      .from(vocabulary)
      .where(eq(vocabulary.userId, userId));

    // Total collections
    const [collectionCount] = await db
      .select({ count: count() })
      .from(collections)
      .where(eq(collections.userId, userId));

    // Words learned (mastered)
    const [masteredCount] = await db
      .select({ count: count() })
      .from(vocabulary)
      .where(and(eq(vocabulary.userId, userId), eq(vocabulary.mastered, true)));

    // Average accuracy from quiz results
    const results = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    const averageAccuracy =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

    // Recent activity
    const recentActivity = await this.getRecentQuizResults(userId, 5);

    // Calculate study streak (simplified - count days with activity)
    const studyStreak = 0; // Simplified for MVP

    return {
      totalWords: wordCount.count,
      totalCollections: collectionCount.count,
      wordsLearned: masteredCount.count,
      averageAccuracy,
      studyStreak,
      recentActivity,
    };
  }
}

export const storage = new DatabaseStorage();
