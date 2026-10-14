// Starts a self-contained environment for the Playwright suite:
// in-memory MongoDB -> seed -> `next build` (into .next-e2e) -> `next start`.
import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";
import { E2E_PORT, E2E_USERS } from "../tests/e2e/fixtures";

async function main() {
  const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 90_000 } });
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "production",
    MONGODB_URI: mongo.getUri("humsols_e2e"),
    AUTH_SECRET: "e2e-only-secret-not-used-anywhere-else-0123456789",
    AUTH_URL: `http://localhost:${E2E_PORT}`,
    AUTH_TRUST_HOST: "true",
    SITE_URL: `http://localhost:${E2E_PORT}`,
    MAIL_DRIVER: "log",
    RATE_LIMIT_MAX: "100",
    UPLOAD_DIR: "./test-results/uploads",
    NEXT_DIST_DIR: ".next-e2e",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  Object.assign(process.env, env);

  const { seed } = await import("../lib/seed");
  const { disconnectDB } = await import("../lib/db");
  await seed({ users: Object.values(E2E_USERS).map((u) => ({ ...u })), log: () => {} });
  await disconnectDB();

  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  // Async (not spawnSync): the in-memory MongoDB needs this event loop running
  // to drain its output, or it stalls mid-build.
  const buildCode = await new Promise<number>((resolve) => {
    const build = spawn(npx, ["next", "build"], {
      env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    build.on("exit", (code) => resolve(code ?? 1));
  });
  if (buildCode !== 0) {
    await mongo.stop();
    process.exit(buildCode);
  }

  const server = spawn(npx, ["next", "start", "-p", String(E2E_PORT)], {
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  const stop = async () => {
    server.kill();
    await mongo.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  server.on("exit", async (code) => {
    await mongo.stop();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
