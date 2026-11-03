import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const docker = process.platform === "win32" ? "docker.exe" : "docker";
const project = `orders-products-e2e-${String(process.pid)}`;
const webPort = "3105";
const environment = {
  ...process.env,
  ORDERS_POSTGRES_PASSWORD: randomBytes(24).toString("base64url"),
  PRODUCTS_POSTGRES_PASSWORD: randomBytes(24).toString("base64url"),
  WEB_PORT: webPort,
};
const composeArgs = ["compose", "--project-name", project];

function run(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      stdio: "inherit",
      env: environment,
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${String(code)}`));
    });
  });
}

async function waitForGateway(url) {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error("The E2E gateway did not become healthy within two minutes");
}

try {
  await run(npm, ["run", "typecheck:e2e"]);
  await run(docker, [...composeArgs, "up", "--build", "--detach", "--wait"]);
  await waitForGateway(`http://127.0.0.1:${webPort}/api/health`);
  await run(
    npm,
    [
      "exec",
      "--",
      "playwright",
      "test",
      "--config",
      "playwright.system.config.ts",
    ],
    {
      env: {
        ...environment,
        PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${webPort}`,
      },
    },
  );
} finally {
  await run(docker, [...composeArgs, "down", "--volumes", "--remove-orphans"]);
}
