import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.ORDERS_DATABASE_URL;
if (!connectionString) throw new Error("ORDERS_DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  await prisma.order.deleteMany();
  await prisma.order.createMany({
    data: ["Office equipment delivery", "Monitors for design team", "Hardware replenishment", "Workstation upgrade"].map((title, index) => ({
      title,
      description: "Inventory intake",
      createdAt: new Date(`2025-0${index + 1}-06T12:09:33.000Z`)
    }))
  });
}

void main().finally(() => prisma.$disconnect());
