import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

/**
 * Service that extends the PrismaClient to handle database connections.
 * Automatically connects and disconnects on module lifecycle events.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL as string,
        });

        super({ adapter });
    }

    /**
     * Initializes the connection to the database.
     */
    async onModuleInit() {
        await this.$connect();
    }

    /**
     * Closes the connection to the database.
     */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}