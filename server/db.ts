import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Don't throw error - let storage.ts handle missing DATABASE_URL gracefully
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    pool = null;
    db = null;
  }
}

export { pool, db };
