import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load Next.js env file first
dotenv.config({ path: ".env.local" });
// Fallback to .env if you also use it
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local or .env");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
