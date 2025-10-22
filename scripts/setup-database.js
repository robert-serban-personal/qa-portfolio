const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database connection...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Create some sample users if they don't exist
    console.log('👥 Creating sample users...');
    
    const user1 = await prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://i.pravatar.cc/150?img=68',
      },
    });
    
    const user2 = await prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        avatar: 'https://i.pravatar.cc/150?img=32',
      },
    });
    
    const user3 = await prisma.user.upsert({
      where: { email: 'bob.johnson@example.com' },
      update: {},
      create: {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
    });
    
    console.log('✅ Sample users created:', user1.name, user2.name, user3.name);
    
    // Create some sample tickets
    console.log('🎫 Creating sample tickets...');
    
    const ticket1 = await prisma.ticket.upsert({
      where: { id: 'ticket-1' },
      update: {},
      create: {
        id: 'ticket-1',
        title: 'Implement user authentication',
        description: 'As a user, I want to log in and out securely.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        type: 'FEATURE',
        reporterId: user1.id,
        assigneeId: user2.id,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        labels: {
          create: [
            { name: 'frontend' },
            { name: 'security' },
          ],
        },
      },
    });
    
    const ticket2 = await prisma.ticket.upsert({
      where: { id: 'ticket-2' },
      update: {},
      create: {
        id: 'ticket-2',
        title: 'Fix broken link on homepage',
        description: 'The "Learn More" button on the hero section leads to a 404 page.',
        status: 'TO_DO',
        priority: 'CRITICAL',
        type: 'BUG',
        reporterId: user2.id,
        assigneeId: user1.id,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        labels: {
          create: [
            { name: 'bug' },
            { name: 'UI' },
          ],
        },
      },
    });
    
    console.log('✅ Sample tickets created:', ticket1.title, ticket2.title);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
