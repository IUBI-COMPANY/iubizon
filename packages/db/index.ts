import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnStr: string | undefined;
};

export const createPrismaClient = (): PrismaClient => {
  const connStr =
    process.env.DATABASE_URL?.trim() ||
    process.env.DIRECT_URL?.trim() ||
    "postgresql://postgres:postgres@localhost:5432/postgres";

  const pool = new Pool({
    connectionString: connStr,
    ssl: connStr.includes("supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const getPrisma = (): PrismaClient => {
  const currentConnStr = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (
    !globalForPrisma.prisma ||
    globalForPrisma.prismaConnStr !== currentConnStr
  ) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaConnStr = currentConnStr;
  }
  return globalForPrisma.prisma;
};

/** Cliente singleton con connection pooling via PrismaPg adapter */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (prop === "then" || prop === "toJSON") return undefined;
    const client = getPrisma() as any;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "@prisma/client";
