import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Check for database URL in multiple environment variables
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
  
  try {
    // Set DATABASE_URL for Prisma if it's not set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = databaseUrl;
    }
    
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

