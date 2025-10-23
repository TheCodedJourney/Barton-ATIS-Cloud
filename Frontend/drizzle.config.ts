import { defineConfig } from "drizzle-kit";

if (!import.meta.env.VITE_DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: import.meta.env.VITE_DATABASE_URL,
  },
});
