import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() { super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "postgresql://inventory:inventory@localhost:5432/inventory?schema=public" }) }); }
}
