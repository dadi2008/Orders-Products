import { spawn } from "node:child_process";

const executable = process.platform === "win32" ? "npm.cmd" : "npm";

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${String(code)}`));
    });
  });
}

await run(["run", "typecheck:e2e"]);
await run(["run", "build", "-w", "@inventory/web"]);
await run([
  "exec",
  "--",
  "playwright",
  "test",
  "--config",
  "playwright.config.ts",
  ...process.argv.slice(2),
]);
