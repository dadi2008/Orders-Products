import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

const source = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      app: `${source}app.tsx`,
      common: `${source}common`,
      components: `${source}components`,
      hooks: `${source}hooks`,
      lib: `${source}lib`,
      pages: `${source}pages`,
      store: `${source}store`,
      styles: `${source}styles.css`,
    },
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/common/interfaces/**",
        "src/common/types/**",
      ],
      reporter: ["text", "html", "lcov"],
    },
  },
});
