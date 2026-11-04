-- MySQL Workbench-compatible logical schema for Orders & Products.
-- Open this file in MySQL Workbench and use Database > Reverse Engineer
-- (or execute it against a local MySQL instance) to generate an EER diagram.

CREATE DATABASE IF NOT EXISTS orders_products
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orders_products;

CREATE TABLE warehouses (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(500) NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255) NULL,
  avatar_url TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY users_email_uq (email),
  KEY users_created_at_idx (created_at)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY orders_created_at_idx (created_at)
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  serial_number VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  specification TEXT NULL,
  `condition` ENUM('NEW', 'USED') NOT NULL DEFAULT 'NEW',
  `status` ENUM('AVAILABLE', 'IN_REPAIR', 'ASSIGNED') NOT NULL DEFAULT 'AVAILABLE',
  photo_url TEXT NULL,
  guarantee_start DATETIME(3) NOT NULL,
  guarantee_end DATETIME(3) NOT NULL,
  received_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  order_id INT NOT NULL,
  order_title VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY products_serial_number_uq (serial_number),
  KEY products_type_idx (type),
  KEY products_order_id_idx (order_id)
) ENGINE=InnoDB;

CREATE TABLE prices (
  id INT NOT NULL AUTO_INCREMENT,
  value DECIMAL(12, 2) NOT NULL,
  currency CHAR(3) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  product_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY prices_product_currency_uq (product_id, currency),
  CONSTRAINT prices_product_fk FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE outbox_events (
  id CHAR(36) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  event_key VARCHAR(255) NOT NULL,
  payload JSON NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  available_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  locked_until DATETIME(3) NULL,
  published_at DATETIME(3) NULL,
  dead_lettered_at DATETIME(3) NULL,
  last_error TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY outbox_delivery_idx (published_at, dead_lettered_at, available_at, locked_until)
) ENGINE=InnoDB;
