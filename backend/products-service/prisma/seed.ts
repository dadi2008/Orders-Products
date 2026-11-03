import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ProductCondition,
  ProductStatus,
} from "../src/generated/prisma/client";

const connectionString = process.env.PRODUCTS_DATABASE_URL;
if (!connectionString) throw new Error("PRODUCTS_DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  if ((await prisma.product.count()) > 0) return;
  const products = await Promise.all(
    [1, 2, 3, 4, 5, 6].map((index) =>
      prisma.product.create({
        data: {
          serialNumber: `SN-${String(123456780 + index)}`,
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
          orderId: ((index - 1) % 4) + 1,
          orderTitle: [
            "Длинное предлинное длиннючее название прихода",
            "Длинное название прихода",
            "Длинное предлинное длиннючее название прихода",
            "Длинное предлинное название прихода",
          ][(index - 1) % 4],
          prices: {
            create: [
              { value: 2500.85, currency: "USD", isDefault: false },
              { value: 105000.5, currency: "UAH", isDefault: true },
            ],
          },
        },
      }),
    ),
  );
  console.log(`Seeded ${String(products.length)} default products`);
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
