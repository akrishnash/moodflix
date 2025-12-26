import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

      const prompt = `Based on the user's mood: "${mood}", suggest 3-5 entertainment options.
      Mix of Movies, TV Shows, and YouTube video topics.
      For each, provide a title, type (Movie, TV Show, or YouTube Video), a brief description, and a reason why it fits the mood.
      Return ONLY a JSON object with a key "recommendations" containing an array of objects with keys: title, type, description, reason.
      Example: { "recommendations": [{"title": "The Office", "type": "TV Show", "description": "A mockumentary sitcom...", "reason": "It's lighthearted and funny..."}] }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      let recommendations;
      try {
        const parsed = JSON.parse(content);
        recommendations = parsed.recommendations || parsed;
        if (!Array.isArray(recommendations)) {
            // fallback if structure is weird
            recommendations = [];
        }
      } catch (e) {
          throw new Error("Failed to parse AI response");
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
