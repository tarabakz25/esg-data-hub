import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if(process.env.NODE_ENV !== 'production'){
  globalForPrisma.prisma = db;
}

type PrismaMiddleware<T = any> = (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<T>) => Promise<T>;

const loggingMiddleware: PrismaMiddleware = async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  console.debug(`Prisma: ${params.model}.${params.action} took ${duration}ms`);
  return result;
};

db.$use(loggingMiddleware);

if (typeof process !== 'undefined') {
  const shutdown = async () => {
    await db.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// export const db = globalForPrisma.prisma ?? new PrismaClient(); // この行はすでに削除されているはず

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db; // この行はすでに削除されているはず 