import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const productsSource = fileURLToPath(
  new URL("./backend/products-service/src/", import.meta.url),
);
const ordersSource = fileURLToPath(
  new URL("./backend/orders-service/src/", import.meta.url),
);
const gatewaySource = fileURLToPath(
  new URL("./backend/gateway/src/", import.meta.url),
);
const realtimeSource = fileURLToPath(
  new URL("./backend/realtime-service/src/", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      helpers: `${productsSource}helpers`,
      products: `${productsSource}products`,
      orders: `${ordersSource}orders`,
      users: `${ordersSource}users`,
      database: `${productsSource}database`,
      generated: `${productsSource}generated`,
      inventory: `${gatewaySource}inventory`,
      presence: `${realtimeSource}presence`,
      infrastructure: `${realtimeSource}infrastructure`,
    },
  },
  test: {
    include: ["backend/test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["backend/*/src/**/*.ts"],
      exclude: [
        "**/dist/**",
        "**/generated/**",
        "**/types/**",
        "**/main.ts",
        "**/graphql/models/**",
        "**/inventory/types/**",
      ],
      reporter: ["text", "html", "lcov"],
    },
  },
});
