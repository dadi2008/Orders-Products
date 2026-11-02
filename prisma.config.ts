import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "packages/database/prisma/schema.prisma",
  migrations: {
    path: "packages/database/prisma/migrations"
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://inventory:inventory@localhost:5432/inventory?schema=public"
  }
});
