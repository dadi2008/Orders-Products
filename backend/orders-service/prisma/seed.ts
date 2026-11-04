import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashSecret } from "../src/users/users.service";
import { seedOrders, seedUsers } from "./seed-data";

const connectionString = process.env.ORDERS_DATABASE_URL;
if (!connectionString) throw new Error("ORDERS_DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const orders = await seedOrders(prisma);
  console.log(`Default orders ready: ${String(orders.length)}`);
  const users = await seedUsers(prisma, await hashSecret("Inventory123!"));
  console.log(`Added ${String(users.count)} default users`);
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
