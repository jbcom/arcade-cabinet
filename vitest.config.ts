import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: ["apps/*/vitest.config.ts", "packages/*/vitest.config.ts"],
  },
});
