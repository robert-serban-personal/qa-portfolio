import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | null | undefined;
}

// Check for database URL in multiple environment variables
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || 
         process.env.POSTGRES_URL || 
         process.env.PRISMA_DATABASE_URL;
};

// Create Prisma client with better error handling
const createPrismaClient = (): PrismaClient | null => {
  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    console.warn('No database URL found in environment variables.');
    console.warn('Checked: DATABASE_URL, POSTGRES_URL, PRISMA_DATABASE_URL');
    return null;
  }
  
  console.log('Database URL found:', databaseUrl.substring(0, 20) + '...');
  
  try {
    // Set DATABASE_URL for Prisma if it's not set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = databaseUrl;
    }
    
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    // Test the connection
    console.log('Prisma client created successfully');
    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

// Initialize Prisma client
let prismaClient: PrismaClient | null = null;

try {
  prismaClient = global.prisma ?? createPrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  prismaClient = null;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma;
}

