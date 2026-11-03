# Orders & Products

Inventory management application built from the provided test specification. It shows incoming orders, their products, product guarantees and prices, supports filtering by product type, creating orders, deletion confirmation, route transitions, responsive layout and real-time active-session count.

## Technology

- React, Vite, TypeScript, React Router, Redux Toolkit, Bootstrap and PWA manifest
- NestJS API Gateway, Orders, Products and Realtime services
- PostgreSQL with Prisma ORM 7
- Kafka domain events and Redis-backed Socket.IO presence
- Docker Compose, Vitest and WebAssembly calculation for the product USD total

## Architecture

The frontend is split by business domains into Orders and Products feature applications behind a shared shell. The backend has independently deployable bounded services:

| Service             | Responsibility                                                       | Port                               |
| ------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| `web`               | React SPA and domain UI modules                                      | 3005                               |
| `gateway`           | GraphQL entry point and service routing                              | internal 3000, proxied through web |
| `orders-service`    | Order commands, order aggregation and Kafka events                   | internal 3001                      |
| `products-service`  | Product queries, type filtering and order-deletion event consumption | internal 3002                      |
| `realtime-service`  | Socket.IO presence with Redis adapter                                | 3003                               |
| `orders-postgres`   | Orders service data store                                            | internal 5432                      |
| `products-postgres` | Products service data store                                          | internal 5432                      |
| `kafka`             | `inventory.order.deleted` event stream                               | internal 9092                      |

## Start with Docker

```bash
docker compose up --build
```

Open `http://localhost:3005`. The migration container creates the database schema and seeds sample records before the API services start.

Deleting an order is eventually consistent: orders-service persists the deletion and emits `inventory.order.deleted`; products-service consumes that event in the `products-service-orders` group and idempotently removes the associated products.

Set `ORDERS_POSTGRES_PASSWORD`, `PRODUCTS_POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `.env` before launching Docker Compose. The two PostgreSQL instances are isolated: Orders owns `orders-postgres`, Products owns `products-postgres`.

Stop the stack with:

```bash
docker compose down
```

Add `-v` only when you deliberately want to remove the local PostgreSQL volume.

## Local development

1. Copy `.env.example` to `.env` and provide reachable PostgreSQL, Redis and Kafka instances.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and apply schema:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Run all frontend and backend applications:

```bash
npm run dev
```

The Vite development server is available at `http://localhost:3000` and the gateway at `http://localhost:3100`. Docker exposes the React SPA on port 3005 and Nginx proxies `/graphql` to the internal gateway.

## Quality checks

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:e2e:system
```

`test:e2e` builds the React application and executes browser scenarios with controlled GraphQL responses. These tests cover order creation and deletion, product deletion, title search, type filtering and modal-overlay layout.

`test:e2e:system` creates a separate Docker Compose project with randomly generated database passwords, starts the full stack, executes GraphQL system scenarios without mocks and removes only that project's containers and volumes afterwards. It verifies order and product mutations and the Kafka-driven removal of products after deleting an order.

The frontend uses ESLint with TypeScript, React Hooks and React Refresh rules. Backend services use the typed NestJS ESLint recommended rules with Swagger rules disabled because this API does not expose an OpenAPI contract.

## Authentication

The application exposes GraphQL `register`, `login`, `refreshSession`, and `logout` mutations. Inventory operations require an access JWT. Access tokens expire after 15 minutes; refresh tokens expire after 7 days and rotate on every refresh. The default seeded account is `user1@inventory.local` with password `Inventory123!`.

Each backend service is organized by feature: its module, controller, service and DTOs reside together under `src/<feature>/`, while one-time database and transport setup resides in `src/database/` or `src/infrastructure/`.

## Data model

Prisma schemas: `backend/orders-service/prisma/schema.prisma` and `backend/products-service/prisma/schema.prisma`. Frontend source is in `frontend/`; NestJS services are in `backend/`.

SQL sources compatible with database modelling tools: `database-schema/orders.sql` and `database-schema/products.sql`. For MySQL Workbench, open `database-schema/orders-products.mysql.sql` and use **Database → Reverse Engineer** to create the EER diagram.

## GraphQL API

Gateway exposes GraphQL at `/graphql`. The React client uses this endpoint for all inventory operations. Available operations are `orders`, `order`, `products`, `productTypes`, `createOrder`, `deleteOrder` and `deleteProduct`. `GET /api/health` remains available for health checks.
