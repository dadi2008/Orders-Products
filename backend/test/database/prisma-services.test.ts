import { describe, expect, it } from "vitest";
import { OrdersPrismaService } from "../../orders-service/src/database/prisma.service";
import { ProductsPrismaService } from "../../products-service/src/database/prisma.service";

describe("Prisma services", () => {
  it("requires an orders database URL", () => {
    const value = process.env.ORDERS_DATABASE_URL;
    delete process.env.ORDERS_DATABASE_URL;

    expect(() => new OrdersPrismaService()).toThrow(
      "ORDERS_DATABASE_URL is required",
    );

    if (value) process.env.ORDERS_DATABASE_URL = value;
  });

  it("requires a products database URL", () => {
    const value = process.env.PRODUCTS_DATABASE_URL;
    delete process.env.PRODUCTS_DATABASE_URL;

    expect(() => new ProductsPrismaService()).toThrow(
      "PRODUCTS_DATABASE_URL is required",
    );

    if (value) process.env.PRODUCTS_DATABASE_URL = value;
  });
});
