import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { aiService } from "./ai-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed initial data
  const history = await storage.getMoodRequests();
  if (history.length === 0) {
    await storage.createMoodRequest({
      mood: "Optimistic",
      recommendations: [
        { title: "Ted Lasso", type: "TV Show", description: "An American football coach manages a British soccer team.", reason: "It's full of optimism and kindness." },
        { title: "The Secret Life of Walter Mitty", type: "Movie", description: "A daydreamer escapes his anonymous life.", reason: "Inspiring and visually beautiful." },
        { title: "Daily Dose of Internet", type: "YouTube Video", description: "Curated viral videos.", reason: "Short, wholesome, and positive." }
      ]
    });
  }

  app.post(api.recommendations.create.path, async (req, res) => {
    try {
      const { mood } = api.recommendations.create.input.parse(req.body);

      // Use AI service with fallback support
      let recommendations;
      try {
        recommendations = await aiService.generateRecommendations(mood);
        
        // Ensure recommendations is an array
        if (!Array.isArray(recommendations)) {
          recommendations = [];
        }
      } catch (error) {
        console.error("AI service error:", error);
        // Fallback recommendations will be handled by aiService
        recommendations = [];
      }

      // Store in DB
      await storage.createMoodRequest({
        mood,
        recommendations: recommendations
      });

      res.json({ recommendations });
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to generate recommendations" });
      }
    }
  });

  app.get(api.recommendations.list.path, async (req, res) => {
      const history = await storage.getMoodRequests();
      res.json(history);
  });

  return httpServer;
}
