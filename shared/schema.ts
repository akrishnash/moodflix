import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const moodRequests = pgTable("mood_requests", {
  id: serial("id").primaryKey(),
  mood: text("mood").notNull(),
  recommendations: jsonb("recommendations").notNull(), // Stores the array of recommendations
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMoodRequestSchema = createInsertSchema(moodRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertMoodRequest = z.infer<typeof insertMoodRequestSchema>;
export type MoodRequest = typeof moodRequests.$inferSelect;

export const moodInputSchema = z.object({
  mood: z.string().min(1, "Mood cannot be empty"),
});

export type MoodInput = z.infer<typeof moodInputSchema>;

export interface Recommendation {
  title: string;
  type: "Movie" | "TV Show" | "YouTube Video";
  description: string;
  reason: string;
}
