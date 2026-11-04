import type { PrismaClient } from "../src/generated/prisma/client";

export const defaultOrders = [
  "Длинное предлинное длиннючее название прихода",
  "Длинное название прихода",
  "Длинное предлинное длиннючее название прихода",
  "Длинное предлинное название прихода",
];

export async function seedOrders(prisma: PrismaClient) {
  return prisma.$transaction(async (tx) => {
    // Serialize seeds, including simultaneous manual and deployment runs.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71432001)`;
    const orders = [];
    for (const [index, title] of defaultOrders.entries()) {
      const description = `inventory-seed:order:${String(index + 1)}`;
      const createdAt = new Date(`2025-0${index + 1}-06T12:09:33.000Z`);
      const existing = await tx.order.findFirst({
        where: {
          OR: [
            { description },
            { title, createdAt, description: "Inventory intake" },
          ],
        },
        orderBy: { id: "asc" },
      });
      const order = existing
        ? existing.description === description
          ? existing
          : await tx.order.update({
              where: { id: existing.id },
              data: { description },
            })
        : await tx.order.create({ data: { title, description, createdAt } });
      orders.push(order);
    }
    return orders;
  });
}

export function seedUsers(prisma: PrismaClient, passwordHash: string) {
  return prisma.user.createMany({
    skipDuplicates: true,
    data: Array.from({ length: 20 }, (_, index) => ({
      name:
        index === 0 ? "Александр Мельник" : `Пользователь ${String(index + 1)}`,
      email: `user${String(index + 1)}@inventory.local`,
      passwordHash,
      createdAt: new Date(
        `2025-01-${String(index + 1).padStart(2, "0")}T12:09:33.000Z`,
      ),
    })),
  });
}
