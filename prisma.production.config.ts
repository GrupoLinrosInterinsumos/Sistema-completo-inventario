// Config de Prisma solo para PRODUCCIÓN (Render + Postgres).
// prisma.config.ts sigue siendo el de desarrollo local (SQLite) — no se toca.
//
// Uso (Render, build command):
//   npx prisma generate --config=prisma.production.config.ts
//   npx prisma migrate deploy --config=prisma.production.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.production.prisma",
  migrations: {
    path: "prisma/migrations-production",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
