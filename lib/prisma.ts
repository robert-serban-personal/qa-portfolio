import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create Prisma client if DATABASE_URL is available
const createPrismaClient = () => {
  // Check for database URL in multiple environment variables
  const databaseUrl = process.env.DATABASE_URL || 
                      process.env.POSTGRES_URL || 
                      process.env.PRISMA_DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('No database URL found in environment variables.');
    console.warn('Checked: DATABASE_URL, POSTGRES_URL, PRISMA_DATABASE_URL');
    return null;
  }
  
  console.log('Database URL found:', databaseUrl.substring(0, 20) + '...');
  
  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

