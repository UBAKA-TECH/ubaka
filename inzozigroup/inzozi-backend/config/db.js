import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error.message);
}

export default prisma;
export const isDbConnected = async () => {
  if (!prisma) return false;
  try {
    // Simple raw query check to confirm database connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error("❌ Database connection check failed:", err);
    return false;
  }
};
