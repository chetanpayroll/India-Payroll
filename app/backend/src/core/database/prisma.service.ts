import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }

  /**
   * Clean all tables (for testing)
   */
  async cleanDatabase() {
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }

  /**
   * Enable soft delete middleware
   */
  enableSoftDeleteMiddleware() {
    this.$use(async (params, next) => {
      // Check if status field exists
      if (params.model && params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { status: 'DELETED' };
      }
      if (params.model && params.action === 'deleteMany') {
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data['status'] = 'DELETED';
        } else {
          params.args['data'] = { status: 'DELETED' };
        }
      }
      return next(params);
    });
  }
}
