import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get database URL from environment variables
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || 
         process.env.POSTGRES_URL || 
         process.env.PRISMA_DATABASE_URL;
};

// Create Prisma client
const createPrismaClient = () => {
  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    console.warn('No database URL found in environment variables.');
    console.warn('Checked: DATABASE_URL, POSTGRES_URL, PRISMA_DATABASE_URL');
    return null;
  }
  
  console.log('Database URL found:', databaseUrl.substring(0, 20) + '...');
  
  // Ensure DATABASE_URL is set for Prisma
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = databaseUrl;
  }
  
  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    console.log('Prisma client created successfully');
    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
    });
    return null;
  }
};

// Initialize Prisma client
let prismaClient: PrismaClient | null = null;

try {
  prismaClient = globalForPrisma.prisma ?? createPrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  prismaClient = null;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

