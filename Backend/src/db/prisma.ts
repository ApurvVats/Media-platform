import { PrismaClient } from '@prisma/client';

// Export a single instance to be used across the application
export const prisma = new PrismaClient();
