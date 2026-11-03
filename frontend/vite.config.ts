import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        app: fileURLToPath(new URL("./src/app.tsx", import.meta.url)),
        common: fileURLToPath(new URL("./src/common", import.meta.url)),
        components: fileURLToPath(new URL("./src/components", import.meta.url)),
        hooks: fileURLToPath(new URL("./src/hooks", import.meta.url)),
        lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
        pages: fileURLToPath(new URL("./src/pages", import.meta.url)),
        store: fileURLToPath(new URL("./src/store", import.meta.url)),
        styles: fileURLToPath(new URL("./src/styles.css", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        "/api": {
          target: env.GATEWAY_URL ?? "http://localhost:3100",
          changeOrigin: true,
        },
        "/graphql": {
          target: env.GATEWAY_URL ?? "http://localhost:3100",
          changeOrigin: true,
        },
      },
    },
  };
});
