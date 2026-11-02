import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";

@Injectable()
export class ProductsPrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.PRODUCTS_DATABASE_URL;
    if (!connectionString) throw new Error("PRODUCTS_DATABASE_URL is required");
    super({ adapter: new PrismaPg({ connectionString }) });
  }
}
