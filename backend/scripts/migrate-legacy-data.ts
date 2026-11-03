import { Client } from "pg";

type LegacyOrder = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type LegacyProduct = {
  id: number;
  serialNumber: string;
  title: string;
  type: string;
  specification: string | null;
  condition: "NEW" | "USED";
  status: "AVAILABLE" | "IN_REPAIR" | "ASSIGNED";
  photoUrl: string | null;
  guaranteeStart: Date;
  guaranteeEnd: Date;
  receivedAt: Date;
  orderId: number;
  orderTitle: string;
};

type LegacyPrice = {
  id: number;
  value: string;
  currency: string;
  isDefault: boolean;
  productId: number;
};

async function migrate(): Promise<void> {
  const legacy = new Client({
    connectionString: readConnection("LEGACY_DATABASE_URL"),
  });
  const orders = new Client({
    connectionString: readConnection("ORDERS_DATABASE_URL"),
  });
  const products = new Client({
    connectionString: readConnection("PRODUCTS_DATABASE_URL"),
  });

  await Promise.all([legacy.connect(), orders.connect(), products.connect()]);

  try {
    const legacyOrders = await legacy.query<LegacyOrder>(
      'SELECT id, title, description, "createdAt", "updatedAt" FROM "Order" ORDER BY id',
    );
    const legacyProducts = await legacy.query<LegacyProduct>(
      `SELECT product.id, product."serialNumber", product.title, product.type,
        product.specification, product.condition, product.status, product."photoUrl",
        product."guaranteeStart", product."guaranteeEnd", product."receivedAt",
        product."orderId", orders.title AS "orderTitle"
        FROM "Product" AS product
        INNER JOIN "Order" AS orders ON orders.id = product."orderId"
        ORDER BY product.id`,
    );
    const legacyPrices = await legacy.query<LegacyPrice>(
      'SELECT id, value, currency, "isDefault", "productId" FROM "Price" ORDER BY id',
    );

    await orders.query("BEGIN");
    await products.query("BEGIN");

    for (const order of legacyOrders.rows) {
      await orders.query(
        `INSERT INTO "Order" (id, title, description, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING`,
        [
          order.id,
          order.title,
          order.description,
          order.createdAt,
          order.updatedAt,
        ],
      );
    }

    for (const product of legacyProducts.rows) {
      await products.query(
        `INSERT INTO "Product" (
          id, "serialNumber", title, type, specification, condition, status, "photoUrl",
          "guaranteeStart", "guaranteeEnd", "receivedAt", "orderId", "orderTitle"
        ) VALUES (
          $1, $2, $3, $4, $5, $6::"ProductCondition", $7::"ProductStatus", $8,
          $9, $10, $11, $12, $13
        ) ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.serialNumber,
          product.title,
          product.type,
          product.specification,
          product.condition,
          product.status,
          product.photoUrl,
          product.guaranteeStart,
          product.guaranteeEnd,
          product.receivedAt,
          product.orderId,
          product.orderTitle,
        ],
      );
    }

    for (const price of legacyPrices.rows) {
      await products.query(
        `INSERT INTO "Price" (id, value, currency, "isDefault", "productId")
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING`,
        [
          price.id,
          price.value,
          price.currency,
          price.isDefault,
          price.productId,
        ],
      );
    }

    await resetSequence(orders, "Order");
    await resetSequence(products, "Product");
    await resetSequence(products, "Price");
    await Promise.all([orders.query("COMMIT"), products.query("COMMIT")]);
    console.log(
      `Migrated ${String(legacyOrders.rowCount)} orders, ${String(legacyProducts.rowCount)} products and ${String(legacyPrices.rowCount)} prices`,
    );
  } catch (error: unknown) {
    await Promise.allSettled([
      orders.query("ROLLBACK"),
      products.query("ROLLBACK"),
    ]);
    throw error;
  } finally {
    await Promise.all([legacy.end(), orders.end(), products.end()]);
  }
}

async function resetSequence(client: Client, table: string): Promise<void> {
  await client.query(
    `SELECT setval(
      pg_get_serial_sequence($1, 'id'),
      GREATEST(COALESCE((SELECT MAX(id) FROM ${quoteIdentifier(table)}), 1), 1),
      true
    )`,
    [quoteIdentifier(table)],
  );
}

function readConnection(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  const url = new URL(value);
  url.searchParams.delete("schema");
  return url.toString();
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

void migrate();
