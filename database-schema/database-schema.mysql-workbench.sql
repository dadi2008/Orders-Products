-- Database schema: MySQL 8-compatible review model for MySQL Workbench.
-- Import: File > Import > Reverse Engineer MySQL Create Script.
-- Runtime uses PostgreSQL. See the root README.md for type mappings.
-- Two service-owned schemas; seven tables; no cross-service foreign keys.
-- This file is for an empty model/database and does not migrate application data.

CREATE DATABASE IF NOT EXISTS orders_service
  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE DATABASE IF NOT EXISTS products_service
  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

USE orders_service;

CREATE TABLE `Order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` TEXT NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB;

CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL DEFAULT '',
  `refreshTokenHash` TEXT NULL,
  `avatarUrl` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB;

CREATE TABLE `Warehouse` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `latitude` DOUBLE NOT NULL,
  `longitude` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `OutboxEvent` (
  `id` VARCHAR(255) NOT NULL,
  `topic` TEXT NOT NULL,
  `key` TEXT NOT NULL,
  `payload` JSON NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `availableAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lockedUntil` DATETIME(3) NULL,
  `publishedAt` DATETIME(3) NULL,
  `deadLetteredAt` DATETIME(3) NULL,
  `lastError` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OutboxEvent_delivery_idx` (`publishedAt`, `deadLetteredAt`, `availableAt`, `lockedUntil`)
) ENGINE=InnoDB;

USE products_service;

CREATE TABLE `Product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `serialNumber` VARCHAR(255) NOT NULL,
  `title` TEXT NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `specification` TEXT NULL,
  `condition` ENUM('NEW', 'USED') NOT NULL DEFAULT 'NEW',
  `status` ENUM('AVAILABLE', 'IN_REPAIR', 'ASSIGNED') NOT NULL DEFAULT 'AVAILABLE',
  `photoUrl` TEXT NULL,
  `guaranteeStart` DATETIME(3) NOT NULL,
  `guaranteeEnd` DATETIME(3) NOT NULL,
  `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `orderId` INT NOT NULL COMMENT 'Logical reference to orders_service.Order.id; no physical foreign key',
  `orderTitle` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_serialNumber_key` (`serialNumber`),
  KEY `Product_type_idx` (`type`),
  KEY `Product_orderId_idx` (`orderId`)
) ENGINE=InnoDB;

CREATE TABLE `Price` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `productId` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Price_productId_currency_key` (`productId`, `currency`),
  CONSTRAINT `Price_productId_fkey` FOREIGN KEY (`productId`)
    REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `OutboxEvent` (
  `id` VARCHAR(255) NOT NULL,
  `topic` TEXT NOT NULL,
  `key` TEXT NOT NULL,
  `payload` JSON NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `availableAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lockedUntil` DATETIME(3) NULL,
  `publishedAt` DATETIME(3) NULL,
  `deadLetteredAt` DATETIME(3) NULL,
  `lastError` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OutboxEvent_delivery_idx` (`publishedAt`, `deadLetteredAt`, `availableAt`, `lockedUntil`)
) ENGINE=InnoDB;
