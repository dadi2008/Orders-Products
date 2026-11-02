CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'USED');
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'IN_REPAIR', 'ASSIGNED');

CREATE TABLE "Product" (
  "id" SERIAL NOT NULL,
  "serialNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "specification" TEXT,
  "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
  "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
  "photoUrl" TEXT,
  "guaranteeStart" TIMESTAMP(3) NOT NULL,
  "guaranteeEnd" TIMESTAMP(3) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "orderId" INTEGER NOT NULL,
  "orderTitle" TEXT NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Price" (
  "id" SERIAL NOT NULL,
  "value" DECIMAL(12,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "productId" INTEGER NOT NULL,
  CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_serialNumber_key" ON "Product"("serialNumber");
CREATE INDEX "Product_type_idx" ON "Product"("type");
CREATE INDEX "Product_orderId_idx" ON "Product"("orderId");
CREATE UNIQUE INDEX "Price_productId_currency_key" ON "Price"("productId", "currency");
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
