import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const productsSource = fileURLToPath(
  new URL("./backend/products-service/src/", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      helpers: `${productsSource}helpers`,
      products: `${productsSource}products`,
      database: `${productsSource}database`,
      generated: `${productsSource}generated`,
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
    coverage: { provider: "v8" },
  },
});
