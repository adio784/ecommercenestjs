import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        super({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Database connected successfully!')
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Database disconnected!');
    }

    async cleanDatabase() {
        if(process.env.NODE_ENV === 'production') {
            throw new Error("Cannot clean database in production")
        }

        const models = Reflect.ownKeys(this).filter(
            (key): key is string => typeof key === "string" && !key.startsWith('_'),
        );

        const prisma = this as unknown as Record<string, { deleteMany: () => Promise<unknown> }>;

        return Promise.all(
            models.map((modelKey) => prisma[modelKey].deleteMany()),
            // models.map((modelKey) => {
            //     if (typeof modelKey === 'string') {
            //         return this[modelKey].deleteMany();
            //     }
            // })
        )
    }
}
