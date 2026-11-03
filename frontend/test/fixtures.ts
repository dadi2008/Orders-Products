import type { Order, Product } from "common/types/inventory";

export const product: Product = {
  id: 8,
  serialNumber: "SN-123456788",
  title: "ASUS ROG Swift OLED PG27AQDM",
  type: "Monitors",
  specification: "Inventory equipment",
  condition: "NEW",
  status: "AVAILABLE",
  guaranteeStart: "2025-04-06T00:00:00.000Z",
  guaranteeEnd: "2028-04-06T00:00:00.000Z",
  receivedAt: "2025-01-06T12:09:33.000Z",
  orderId: 1,
  order: { id: 1, title: "Office equipment delivery" },
  prices: [{ value: 2500.85, currency: "USD", isDefault: true }],
};

export const secondProduct: Product = {
  ...product,
  id: 9,
  serialNumber: "SN-123456789",
  title: "Gigabyte Technology X58-USB3",
  type: "Motherboards",
  status: "IN_REPAIR",
  orderId: 2,
  order: { id: 2, title: "Hardware replenishment" },
};

export const order: Order = {
  id: 1,
  title: "Office equipment delivery",
  description: "Inventory intake",
  createdAt: "2025-01-06T12:09:33.000Z",
  productCount: 1,
  totals: { USD: 2500.85 },
  products: [product],
};

export const secondOrder: Order = {
  id: 2,
  title: "Hardware replenishment",
  createdAt: "2025-02-06T12:09:33.000Z",
  productCount: 1,
  totals: { USD: 2500.85 },
  products: [secondProduct],
};
