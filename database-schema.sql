CREATE TYPE product_condition AS ENUM ('NEW', 'USED');
CREATE TYPE product_status AS ENUM ('AVAILABLE', 'IN_REPAIR', 'ASSIGNED');

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  specification TEXT,
  condition product_condition NOT NULL DEFAULT 'NEW',
  status product_status NOT NULL DEFAULT 'AVAILABLE',
  photo_url TEXT,
  guarantee_start TIMESTAMPTZ NOT NULL,
  guarantee_end TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE prices (
  id SERIAL PRIMARY KEY,
  value NUMERIC(12,2) NOT NULL CHECK (value >= 0),
  currency CHAR(3) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, currency)
);

CREATE INDEX products_type_idx ON products(type);
CREATE INDEX products_order_id_idx ON products(order_id);
