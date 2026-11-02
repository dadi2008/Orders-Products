import { PrismaClient, ProductCondition, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const createProduct = (index: number, orderId: number, type: string, status: ProductStatus) => ({
  serialNumber: `SN-${String(123456780 + index)}`,
  title: index % 2 ? "ASUS ROG Swift OLED PG27AQDM" : "Gigabyte Technology X58-USB3",
  type,
  specification: index % 2 ? "27-inch QHD OLED, 240 Hz" : "Socket 1366, USB 3.0",
  condition: index % 3 ? ProductCondition.NEW : ProductCondition.USED,
  status,
  photoUrl: null,
  guaranteeStart: new Date("2025-04-06T00:00:00.000Z"),
  guaranteeEnd: new Date("2028-04-06T00:00:00.000Z"),
  receivedAt: new Date(`2025-0${(index % 6) + 1}-06T12:09:33.000Z`),
  orderId,
  prices: {
    create: [
      { value: 2500.85, currency: "USD", isDefault: false },
      { value: 105000.5, currency: "UAH", isDefault: true }
    ]
  }
});

async function main() {
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();

  const orders = await Promise.all(
    ["Office equipment delivery", "Monitors for design team", "Hardware replenishment", "Workstation upgrade"].map((title, index) =>
      prisma.order.create({
        data: {
          title,
          description: "Inventory intake",
          createdAt: new Date(`2025-0${index + 1}-06T12:09:33.000Z`)
        }
      })
    )
  );

  await prisma.product.createMany({ data: [] });
  await Promise.all([
    prisma.product.create({ data: createProduct(1, orders[0].id, "Monitors", ProductStatus.AVAILABLE) }),
    prisma.product.create({ data: createProduct(2, orders[0].id, "Monitors", ProductStatus.ASSIGNED) }),
    prisma.product.create({ data: createProduct(3, orders[1].id, "Monitors", ProductStatus.IN_REPAIR) }),
    prisma.product.create({ data: createProduct(4, orders[1].id, "Laptops", ProductStatus.AVAILABLE) }),
    prisma.product.create({ data: createProduct(5, orders[2].id, "Networking", ProductStatus.AVAILABLE) }),
    prisma.product.create({ data: createProduct(6, orders[3].id, "Monitors", ProductStatus.ASSIGNED) })
  ]);
}

main().finally(() => prisma.$disconnect());
