import { PrismaClient } from "../src/generated/prisma/client";
import { UserRole } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding...');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@shop.com' },
        update: {},
        create: {
            email: 'admin@shop.com',
            passwordHash: 'CHANGE_ME_LATER', // will be hashed in auth phase
            role: UserRole.ADMIN,
        },
    });
    console.log('Created admin:', admin);

    const customer = await prisma.user.upsert({
        where: { email: 'customer@shop.com' },
        update: {},
        create: {
            email: 'customer@shop.com',
            passwordHash: 'CHANGE_ME_LATER',
            role: UserRole.CUSTOMER,
        },
    });
    console.log('Created customer:', customer);

    const electronics = await prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronics',
        },
    });
    console.log('Created category electronics:', electronics);

    const clothing = await prisma.category.upsert({
        where: { slug: 'clothing' },
        update: {},
        create: {
            name: 'Clothing',
            slug: 'clothing',
        },
    });
    console.log('Created category clothing:', clothing);

    await prisma.product.create({
        data: {
            title: 'Wireless Mouse',
            slug: 'wireless-mouse',
            price: 29.99,
            stock: 100,
            sku: 'WM-001',
            category: {
                connect: { id: electronics.id },
            },
        },
    });

    await prisma.product.create({
        data: {
            title: 'Mechanical Keyboard',
            slug: 'mechanical-keyboard',
            price: 89.99,
            stock: 50,
            sku: 'MK-002',
            category: {
                connect: { id: electronics.id },
            },
        },
    });

    await prisma.product.create({
        data: {
            title: 'Cotton T-Shirt',
            slug: 'cotton-tshirt',
            price: 19.99,
            stock: 200,
            sku: 'TS-003',
            category: {
                connect: { id: clothing.id },
            },
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });