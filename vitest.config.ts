import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    fileParallelism: false,
    testTimeout: 30_000,
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions:
          process.env.GITHUB_ACTIONS === "true"
            ? {
                channel: "chrome",
              }
            : undefined,
      }),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
    setupFiles: "./app/test/setup.ts",
    include: ["app/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}", "e2e/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "app"),
      "@logic": path.resolve(__dirname, "src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      three: path.resolve(__dirname, "node_modules/three"),
      "framer-motion": path.resolve(__dirname, "node_modules/framer-motion"),
    },
    dedupe: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/rapier",
      "framer-motion",
      "koota",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/rapier",
      "framer-motion",
      "koota",
      "simplex-noise",
      "@testing-library/jest-dom/vitest",
    ],
  },
});
