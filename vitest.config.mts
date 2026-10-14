import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
    // One in-memory MongoDB per test file; files run in separate workers.
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 120_000, // first run downloads/starts the MongoDB binary
  },
});
