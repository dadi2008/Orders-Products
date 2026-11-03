import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashSecret } from "../src/users/users.service";

const connectionString = process.env.ORDERS_DATABASE_URL;
if (!connectionString) throw new Error("ORDERS_DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const defaultOrders = [
  "Длинное предлинное длиннючее название прихода",
  "Длинное название прихода",
  "Длинное предлинное длиннючее название прихода",
  "Длинное предлинное название прихода",
];

async function main() {
  if ((await prisma.order.count()) === 0) {
    const result = await prisma.order.createMany({
      data: defaultOrders.map((title, index) => ({
        title,
        description: "Inventory intake",
        createdAt: new Date(`2025-0${index + 1}-06T12:09:33.000Z`),
      })),
    });
    console.log(`Seeded ${String(result.count)} default orders`);
  }

  if ((await prisma.user.count()) === 0) {
    const users = await prisma.user.createMany({
      data: await Promise.all(
        Array.from({ length: 20 }, async (_, index) => {
          const number = index + 1;
          return {
            name:
              number === 1
                ? "Александр Мельник"
                : `Пользователь ${String(number)}`,
            email: `user${String(number)}@inventory.local`,
            passwordHash: await hashSecret("Inventory123!"),
            createdAt: new Date(
              `2025-01-${String((index % 28) + 1).padStart(2, "0")}T12:09:33.000Z`,
            ),
          };
        }),
      ),
    });
    console.log(`Seeded ${String(users.count)} default users`);
  }
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
