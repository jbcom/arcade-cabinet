import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const gamePackages = [
  "bioluminescent-sea",
  "cosmic-gardener",
  "enchanted-forest",
  "entropy-edge",
  "gridizen",
  "mega-track",
  "otterly-chaotic",
  "primordial-ascent",
  "protocol-snw",
  "reach-for-the-sky",
  "realmwalker",
  "sim-soviet",
  "titan-mech",
  "voxel-realms",
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    fileParallelism: false,
    testTimeout: 30_000,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
    setupFiles: "./src/test/setup.ts",
    include: ["packages/*/src/**/*.test.{ts,tsx}", "e2e/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@arcade-cabinet/shared": path.resolve(__dirname, "./packages/shared/src/index.ts"),
      ...Object.fromEntries(
        gamePackages.map((name) => [
          `@arcade-cabinet/${name}`,
          path.resolve(__dirname, `./packages/${name}/src/index.ts`),
        ])
      ),
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
      "@testing-library/jest-dom/vitest",
    ],
  },
});
