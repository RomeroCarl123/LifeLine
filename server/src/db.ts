import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

export async function ensureDatabaseReady() {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed');
      END IF;
    END
    $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status')
         AND NOT EXISTS (
           SELECT 1
           FROM pg_enum
           WHERE enumtypid = 'request_status'::regtype
             AND enumlabel = 'in_progress'
         ) THEN
        ALTER TYPE request_status ADD VALUE 'in_progress' BEFORE 'completed';
      END IF;
    END
    $$;
  `);
}
