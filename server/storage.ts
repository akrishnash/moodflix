import { moodRequests, type MoodRequest, type InsertMoodRequest } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  createMoodRequest(request: InsertMoodRequest): Promise<MoodRequest>;
  getMoodRequests(): Promise<MoodRequest[]>;
}

export class DatabaseStorage implements IStorage {
  async createMoodRequest(insertRequest: InsertMoodRequest): Promise<MoodRequest> {
    const [request] = await db
      .insert(moodRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getMoodRequests(): Promise<MoodRequest[]> {
    return await db
      .select()
      .from(moodRequests)
      .orderBy(desc(moodRequests.createdAt));
  }
}

export const storage = new DatabaseStorage();
