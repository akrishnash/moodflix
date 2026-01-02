import { moodRequests, type MoodRequest, type InsertMoodRequest } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createMoodRequest(request: InsertMoodRequest): Promise<MoodRequest>;
  getMoodRequests(): Promise<MoodRequest[]>;
}

export class DatabaseStorage implements IStorage {
  async createMoodRequest(insertRequest: InsertMoodRequest): Promise<MoodRequest> {
    // Dynamic import to avoid loading db.ts at module load time
    const { db } = await import("./db");
    if (!db) {
      throw new Error("Database not initialized. DATABASE_URL may be missing or invalid.");
    }
    const [request] = await db
      .insert(moodRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getMoodRequests(): Promise<MoodRequest[]> {
    // Dynamic import to avoid loading db.ts at module load time
    const { db } = await import("./db");
    if (!db) {
      throw new Error("Database not initialized. DATABASE_URL may be missing or invalid.");
    }
    return await db
      .select()
      .from(moodRequests)
      .orderBy(desc(moodRequests.createdAt));
  }
}

// In-memory storage for development/testing when database is not available
export class MemoryStorage implements IStorage {
  private requests: MoodRequest[] = [];
  private nextId = 1;

  async createMoodRequest(insertRequest: InsertMoodRequest): Promise<MoodRequest> {
    const request: MoodRequest = {
      id: this.nextId++,
      mood: insertRequest.mood,
      recommendations: insertRequest.recommendations,
      createdAt: new Date(),
    };
    this.requests.unshift(request); // Add to beginning
    return request;
  }

  async getMoodRequests(): Promise<MoodRequest[]> {
    return [...this.requests]; // Return copy, sorted by creation (newest first)
  }
}

// Lazy initialization - use database if available, otherwise use in-memory storage
let _storage: IStorage | null = null;

async function getStorage(): Promise<IStorage> {
  if (_storage) {
    return _storage;
  }

  // Try to use database if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    try {
      // Test if we can import db and it's initialized
      const { db } = await import("./db");
      if (db) {
        _storage = new DatabaseStorage();
        console.log("✅ Using database storage");
        return _storage;
      } else {
        console.log("⚠️  Database not initialized, falling back to in-memory storage");
      }
    } catch (error: any) {
      console.log("⚠️  Database connection failed:", error.message);
      console.log("   Falling back to in-memory storage");
    }
  } else {
    // Only show warning if DATABASE_URL is explicitly not set
    // (don't spam logs if it's just not configured)
    console.log("ℹ️  DATABASE_URL not set, using in-memory storage (history won't persist across restarts)");
  }
  _storage = new MemoryStorage();
  return _storage;
}

// Wrapper that initializes storage on first use
export const storage = {
  createMoodRequest: async (request: InsertMoodRequest) => {
    const s = await getStorage();
    return s.createMoodRequest(request);
  },
  getMoodRequests: async () => {
    const s = await getStorage();
    return s.getMoodRequests();
  },
};
