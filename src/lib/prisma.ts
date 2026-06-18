import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Neon's serverless driver needs a WebSocket implementation in Node.js.
// In edge/serverless runtimes (Vercel) a global WebSocket exists, so only
// set it when one isn't already present.
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

// Reuse the Prisma client across hot reloads / serverless invocations.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  // PrismaNeon is a driver-adapter factory; it manages the connection pool.
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazily instantiate on first use so that importing this module (e.g. during
// `next build` / page-data collection) does not require DATABASE_URL to be set.
// The client is only created when a query is actually issued at runtime.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma() as object, prop, receiver);
  },
});
