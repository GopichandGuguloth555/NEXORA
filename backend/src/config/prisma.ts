import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[Prisma] DATABASE_URL environment variable is not set. " +
    "Set it on Render under Environment > Environment Variables."
  );
}

// Log the host (not credentials) so Render logs show which DB is targeted
try {
  const url = new URL(connectionString);
  console.log(`[Prisma] Connecting to PostgreSQL host: ${url.hostname}:${url.port || 5432} / db: ${url.pathname.slice(1)}`);
} catch {
  console.log("[Prisma] DATABASE_URL is set (URL parse failed for logging, connecting anyway)");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Eagerly test the connection so startup failures surface in Render logs
// rather than appearing as mysterious 500s on the first request.
prisma.$connect().then(() => {
  console.log("[Prisma] Database connection established.");
}).catch((err: unknown) => {
  console.error("[Prisma] FATAL: Failed to connect to database:", err);
  // Do not crash the process here — let individual requests fail with proper errors.
});

export default prisma;
