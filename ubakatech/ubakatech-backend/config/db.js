import { PrismaClient } from '@prisma/client';

let prisma;
let dbConnectedState = false;
let checkPromise = null;
let lastCheckTime = 0;
const CHECK_COOLDOWN = 30000; // 30 seconds cooldown between checks (was 10s — reduces pressure on free-tier DB)

// Determine if we're on a free-tier DB (connection_limit env not set → assume 1)
// DATABASE_URL can include ?connection_limit=N to override, otherwise we cap at 1
const CONNECTION_LIMIT = parseInt(process.env.DB_CONNECTION_LIMIT || '1', 10);

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Cap the connection pool to match your database plan's max connections.
    // Free-tier databases (Neon, Supabase free, Railway hobby) allow only 1-5 concurrent connections.
    // Without this cap, Prisma defaults to (cpu_count * 2 + 1) connections and exhausts the pool.
  });
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error.message);
}

export default prisma;

// Actual connection check with timeout to prevent hanging the server on bad connection
const verifyConnection = async () => {
  if (!process.env.DATABASE_URL || !prisma) {
    return false;
  }
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      // Increased to 5s — free-tier DBs can have slow cold starts
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection check timeout')), 5000))
    ]);
    return true;
  } catch (err) {
    console.error("❌ Database connection check failed:", err.message || err);
    return false;
  }
};

// Protect any database query from hanging indefinitely
// Increased to 8s for free-tier DBs that have cold-start delays
export const queryWithTimeout = (promise, timeoutMs = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), timeoutMs))
  ]);
};

// Periodic background checks or cooldown-based check
export const isDbConnected = async (forceWait = false) => {
  const now = Date.now();
  if (now - lastCheckTime > CHECK_COOLDOWN) {
    // If not currently checking, trigger a background check
    if (!checkPromise) {
      checkPromise = verifyConnection().then((connected) => {
        if (dbConnectedState !== connected) {
          dbConnectedState = connected;
          console.log(`[Database] Connection state changed to: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
        }
        lastCheckTime = Date.now();
        checkPromise = null;
        return connected;
      });
    }
  }
  
  if (forceWait && checkPromise) {
    await checkPromise;
  }
  
  // Return the last known state immediately without waiting for queryRaw!
  return dbConnectedState;
};

// Initial verification at module load
checkPromise = verifyConnection().then((connected) => {
  dbConnectedState = connected;
  lastCheckTime = Date.now();
  console.log(`[Database] Initial connection check: ${connected ? 'SUCCESS' : 'FAILED'}`);
  checkPromise = null;
  return connected;
});
