// API Routes for VocabMaster
// Handles all CRUD operations and learning mode endpoints

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCollectionSchema, insertVocabularySchema, insertQuizResultSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seed";
import OpenAI from "openai";

// Helper to extract user ID from session
function getUserId(req: any): string {
  // Google OAuth: user ID is serialized directly
  if (typeof req.user === "string") return req.user;
  // Fallback for user object
  if (req.user?.id) return req.user.id;
  throw new Error("User ID not found in session");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Google OAuth
  await setupAuth(app);

  // Auth routes - get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile update
  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { firstName, lastName } = req.body;
      
      const user = await storage.updateUser(userId, { firstName, lastName });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Collections routes
  app.get("/api/collections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const collections = await storage.getCollections(userId);
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const collection = await storage.getCollection(id);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Collection with vocabulary (used by collection detail page)
  app.get("/api/collections/:id/vocabulary", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const collection = await storage.getCollectionWithVocabulary(id);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection with vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Get vocabulary words for learning modes
  app.get("/api/collections/:id/vocabulary/words", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vocab = await storage.getVocabularyByCollection(id);
      res.json(vocab);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch vocabulary" });
    }
  });

  app.post("/api/collections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validated = insertCollectionSchema.parse({
        ...req.body,
        userId,
      });
      
      const collection = await storage.createCollection(validated);
      res.status(201).json(collection);
    } catch (error) {
      console.error("Error creating collection:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create collection" });
    }
  });

  app.patch("/api/collections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;
      
      const collection = await storage.updateCollection(id, { name, description, color });
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      res.json(collection);
    } catch (error) {
      console.error("Error updating collection:", error);
      res.status(500).json({ message: "Failed to update collection" });
    }
  });

  app.delete("/api/collections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCollection(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Vocabulary routes
  app.get("/api/vocabulary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const vocab = await storage.getVocabulary(userId);
      res.json(vocab);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch vocabulary" });
    }
  });

  app.get("/api/vocabulary/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vocab = await storage.getVocabularyById(id);
      
      if (!vocab) {
        return res.status(404).json({ message: "Vocabulary not found" });
      }
      
      res.json(vocab);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch vocabulary" });
    }
  });

  app.post("/api/vocabulary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validated = insertVocabularySchema.parse({
        ...req.body,
        userId,
      });
      
      const vocab = await storage.createVocabulary(validated);
      res.status(201).json(vocab);
    } catch (error) {
      console.error("Error creating vocabulary:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vocabulary" });
    }
  });

  app.patch("/api/vocabulary/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { word, meaning, example, collectionId, mastered } = req.body;
      
      const vocab = await storage.updateVocabulary(id, { 
        word, 
        meaning, 
        example, 
        collectionId, 
        mastered 
      });
      
      if (!vocab) {
        return res.status(404).json({ message: "Vocabulary not found" });
      }
      
      res.json(vocab);
    } catch (error) {
      console.error("Error updating vocabulary:", error);
      res.status(500).json({ message: "Failed to update vocabulary" });
    }
  });

  app.delete("/api/vocabulary/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVocabulary(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      res.status(500).json({ message: "Failed to delete vocabulary" });
    }
  });

  // Bulk import vocabulary
  app.post("/api/vocabulary/import", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { vocabulary: vocabItems, collectionId } = req.body;
      
      if (!Array.isArray(vocabItems) || vocabItems.length === 0) {
        return res.status(400).json({ message: "Invalid vocabulary data" });
      }
      
      const imported = await storage.importVocabulary(userId, vocabItems, collectionId);
      res.status(201).json({ imported });
    } catch (error) {
      console.error("Error importing vocabulary:", error);
      res.status(500).json({ message: "Failed to import vocabulary" });
    }
  });

  // Quiz results
  app.post("/api/quiz-results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validated = insertQuizResultSchema.parse({
        ...req.body,
        userId,
      });
      
      const result = await storage.saveQuizResult(validated);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save quiz result" });
    }
  });

  // Text-to-speech pronunciation
  app.post("/api/tts", isAuthenticated, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      const buffer = await mp3.arrayBuffer();
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generating TTS:", error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  // Seed data endpoint
  app.post("/api/seed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Check if user already has data
      const existingCollections = await storage.getCollections(userId);
      if (existingCollections.length > 0) {
        return res.status(400).json({ 
          message: "Data already exists. Clear existing data first if you want to reseed." 
        });
      }
      
      const success = await seedDatabase(userId);
      if (success) {
        res.json({ message: "Database seeded successfully" });
      } else {
        res.status(500).json({ message: "Failed to seed database" });
      }
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
