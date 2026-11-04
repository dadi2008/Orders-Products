import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ProductCondition,
  ProductStatus,
} from "../src/generated/prisma/client";
import { PrismaClient as OrdersPrismaClient } from "../../orders-service/src/generated/prisma/client";
import { defaultOrders } from "../../orders-service/prisma/seed-data";

const connectionString = process.env.PRODUCTS_DATABASE_URL;
if (!connectionString) throw new Error("PRODUCTS_DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const ordersConnectionString = process.env.ORDERS_DATABASE_URL;
if (!ordersConnectionString) throw new Error("ORDERS_DATABASE_URL is required");
const ordersPrisma = new OrdersPrismaClient({
  adapter: new PrismaPg({ connectionString: ordersConnectionString }),
});

async function main() {
  const orders = await Promise.all(
    defaultOrders.map((_, index) =>
      ordersPrisma.order.findFirst({
        where: { description: `inventory-seed:order:${String(index + 1)}` },
        orderBy: { id: "asc" },
      }),
    ),
  );
  if (orders.some((order) => !order))
    throw new Error(
      "Default orders are missing; run the orders seed before the products seed",
    );
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71432002)`;
    for (const index of [1, 2, 3, 4, 5, 6]) {
      const serialNumber = `SN-${String(123456780 + index)}`;
      if (await tx.product.findUnique({ where: { serialNumber } })) continue;
      const order = orders[(index - 1) % 4];
      if (!order) throw new Error("Default order is missing");
      await tx.product.create({
        data: {
          serialNumber,
          title:
            index % 2
              ? "ASUS ROG Swift OLED PG27AQDM"
              : "Gigabyte Technology X58-USB3",
          type:
            index === 5 ? "Networking" : index === 4 ? "Laptops" : "Monitors",
          specification: "Inventory equipment",
          condition: index % 3 ? ProductCondition.NEW : ProductCondition.USED,
          status:
            index % 3 === 0 ? ProductStatus.IN_REPAIR : ProductStatus.AVAILABLE,
          guaranteeStart: new Date("2025-04-06T00:00:00.000Z"),
          guaranteeEnd: new Date("2028-04-06T00:00:00.000Z"),
          receivedAt: new Date(`2025-0${(index % 4) + 1}-06T12:09:33.000Z`),
          orderId: order.id,
          orderTitle: order.title,
          prices: {
            create: [
              { value: 2500.85, currency: "USD", isDefault: false },
              { value: 105000.5, currency: "UAH", isDefault: true },
            ],
          },
        },
      });
    }
  });
  console.log("Default products ready");
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() =>
    Promise.all([prisma.$disconnect(), ordersPrisma.$disconnect()]),
  );
