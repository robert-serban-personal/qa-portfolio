import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'No database URL found. Please set DATABASE_URL or POSTGRES_URL in Vercel environment variables.' 
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    console.log('Creating Prisma client with URL:', databaseUrl.substring(0, 20) + '...');
    
    // Create Prisma client with explicit datasource
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    console.log('Testing connection...');
    await prisma.$connect();
    console.log('Connected successfully!');

    // Create tables using raw SQL
    console.log('Creating database tables...');
    
    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "avatar" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;

    // Create tickets table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tickets" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'TO_DO',
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "type" TEXT NOT NULL DEFAULT 'TASK',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "dueDate" TIMESTAMP(3),
        "assigneeId" TEXT,
        "reporterId" TEXT NOT NULL
      );
    `;

    // Create ticket_labels table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ticket_labels" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "ticketId" TEXT NOT NULL,
        UNIQUE("name", "ticketId")
      );
    `;

    // Create attachments table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "attachments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ticketId" TEXT NOT NULL
      );
    `;

    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "tickets" ADD CONSTRAINT IF NOT EXISTS "tickets_assigneeId_fkey" 
      FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "tickets" ADD CONSTRAINT IF NOT EXISTS "tickets_reporterId_fkey" 
      FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "ticket_labels" ADD CONSTRAINT IF NOT EXISTS "ticket_labels_ticketId_fkey" 
      FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "attachments" ADD CONSTRAINT IF NOT EXISTS "attachments_ticketId_fkey" 
      FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log('Tables created successfully!');

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully!',
      databaseUrl: databaseUrl.substring(0, 20) + '...'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
    
  } catch (error) {
    console.error('Database migration error:', error);
    
    return NextResponse.json({ 
      error: 'Database migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
