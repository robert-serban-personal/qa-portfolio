import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike@example.com' },
      update: {},
      create: {
        name: 'Mike Johnson',
        email: 'mike@example.com',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
      },
    }),
  ]);

  // Create sample tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Fix login bug',
        description: 'Users are unable to log in with their credentials. Need to investigate the authentication flow.',
        status: 'TO_DO',
        priority: 'HIGH',
        type: 'BUG',
        assigneeId: users[0].id,
        reporterId: users[1].id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        labels: {
          create: [
            { name: 'authentication' },
            { name: 'critical' },
          ],
        },
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Add dark mode',
        description: 'Implement dark mode toggle for better user experience.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        type: 'FEATURE',
        assigneeId: users[2].id,
        reporterId: users[0].id,
        labels: {
          create: [
            { name: 'ui' },
            { name: 'enhancement' },
          ],
        },
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Update documentation',
        description: 'Update API documentation to reflect recent changes.',
        status: 'DONE',
        priority: 'LOW',
        type: 'TASK',
        assigneeId: users[3].id,
        reporterId: users[1].id,
        labels: {
          create: [
            { name: 'documentation' },
          ],
        },
      },
    }),
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created ${users.length} users and ${tickets.length} tickets`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

