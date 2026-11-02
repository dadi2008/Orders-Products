# Orders & Products

Inventory management application built from the provided test specification. It shows incoming orders, their products, product guarantees and prices, supports filtering by product type, creating orders, deletion confirmation, route transitions, responsive layout and real-time active-session count.

## Technology

- Next.js, React, TypeScript, Redux Toolkit, Bootstrap and PWA manifest
- NestJS API Gateway, Orders, Products and Realtime services
- PostgreSQL with Prisma ORM 7
- Kafka domain events and Redis-backed Socket.IO presence
- Docker Compose, Vitest and WebAssembly calculation for the product USD total

## Architecture

The frontend is split by business domains into Orders and Products feature applications behind a shared shell. The backend has independently deployable bounded services:

| Service | Responsibility | Port |
| --- | --- | --- |
| `web` | Next.js shell and domain UI modules | 3005 |
| `gateway` | Single REST entry point and service routing | internal 3000, proxied through web |
| `orders-service` | Order commands, order aggregation and Kafka events | internal 3001 |
| `products-service` | Product queries and type filtering | internal 3002 |
| `realtime-service` | Socket.IO presence with Redis adapter | 3003 |
| `postgres` | Persistent inventory data | internal 5432 |
| `kafka` | `inventory.order.created` and `inventory.order.deleted` event stream | internal 9092 |

## Start with Docker

```bash
docker compose up --build
```

Open `http://localhost:3005`. The migration container creates the database schema and seeds sample records before the API services start.

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

The Next.js app is available at `http://localhost:3000` during local development and the gateway at `http://localhost:3100`. Docker exposes the web application on port 3005 and proxies `/api` to the internal gateway.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

The frontend uses Next.js Core Web Vitals linting. Backend services use the typed NestJS ESLint recommended rules with Swagger rules disabled because this API does not expose an OpenAPI contract.

## Data model

Prisma schema: `packages/database/prisma/schema.prisma`. Frontend source is in `frontend/`; NestJS services are in `backend/`.

SQL relational diagram source compatible with database modelling tools: `database-schema.sql`.

## REST API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Gateway health status |
| `GET` | `/api/orders` | Orders with product count and totals |
| `POST` | `/api/orders` | Create order with `title` and optional `description` |
| `DELETE` | `/api/orders/:id` | Delete order and attached products |
| `GET` | `/api/products` | Products; optional `type` query filter |
| `GET` | `/api/products/types` | Available product types |
