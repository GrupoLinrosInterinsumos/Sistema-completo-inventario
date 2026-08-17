import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

// Desarrollo local usa SQLite; producción (Render) usa Postgres — el cliente
// generado ya coincide con uno u otro según qué schema se haya usado para
// `prisma generate` en cada entorno (ver prisma/schema.production.prisma).
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const esPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

// Render (y la mayoría de Postgres administrados) exige SSL incluso cuando
// la URL de conexión no trae `?sslmode=...` — sin esto, la conexión se
// rechaza y el error queda enmascarado como "credenciales incorrectas" en
// el login. Se fuerza explícitamente en vez de depender del formato de la URL.
const adapter = esPostgres
  ? new PrismaPg({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  : new PrismaBetterSqlite3({ url: databaseUrl });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
