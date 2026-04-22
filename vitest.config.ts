import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: false,
    },
    setupFiles: "./src/test/setup.ts",
    include: ["packages/*/src/**/*.test.{ts,tsx}", "e2e/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@arcade-cabinet/shared": path.resolve(__dirname, "./packages/shared/src/index.ts"),
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
      "koota",
      "@react-three/rapier",
      "framer-motion",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "koota",
      "@react-three/rapier",
      "framer-motion",
      "vitest-browser-react",
    ],
  },
});
