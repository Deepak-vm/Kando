import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo user
    const demoPassword = await bcrypt.hash('demo1234', 10);
    const user = await prisma.user.create({
        data: {
            name: 'Demo User',
            email: 'demo@example.com',
            password: demoPassword,
            role: 'ADMIN',
        },
    });
    console.log('✅ Created demo user:', user.email);

    // Create project
    const project = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Redesign the company website for better UX',
            ownerId: user.id,
            members: {
                create: {
                    userId: user.id,
                    role: 'ADMIN',
                },
            },
        },
    });
    console.log('✅ Created project:', project.name);

    // Create default columns
    const columns = await Promise.all([
        prisma.column.create({
            data: {
                name: 'To Do',
                position: 0,
                projectId: project.id,
            },
        }),
        prisma.column.create({
            data: {
                name: 'In Progress',
                position: 1,
                projectId: project.id,
            },
        }),
        prisma.column.create({
            data: {
                name: 'In Review',
                position: 2,
                projectId: project.id,
            },
        }),
        prisma.column.create({
            data: {
                name: 'Done',
                position: 3,
                projectId: project.id,
            },
        }),
    ]);
    console.log('✅ Created 4 default columns');

    // Create sample tasks
    const todoColumn = columns[0];
    const inProgressColumn = columns[1];
    const doneColumn = columns[3];

    await prisma.task.create({
        data: {
            title: 'Design homepage layout',
            description: 'Create mockups and wireframes for the new homepage',
            status: 'TODO',
            priority: 'HIGH',
            position: 0,
            columnId: todoColumn.id,
            creatorId: user.id,
            assigneeId: user.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
    });

    await prisma.task.create({
        data: {
            title: 'Implement responsive navigation',
            description: 'Make the navbar responsive for mobile devices',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            position: 0,
            columnId: inProgressColumn.id,
            creatorId: user.id,
            assigneeId: user.id,
        },
    });

    await prisma.task.create({
        data: {
            title: 'Set up analytics',
            description: 'Integrate Google Analytics and set up tracking',
            status: 'DONE',
            priority: 'LOW',
            position: 0,
            columnId: doneColumn.id,
            creatorId: user.id,
            assigneeId: user.id,
        },
    });

    console.log('✅ Created 3 sample tasks');
    console.log('\n🎉 Seeding complete!');
    console.log('Demo credentials: email=demo@example.com, password=demo1234');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
