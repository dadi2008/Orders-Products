import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.ORDERS_DATABASE_URL;
    if (!connectionString) throw new Error("ORDERS_DATABASE_URL is required");
    super({ adapter: new PrismaPg({ connectionString }) });
  }
}
