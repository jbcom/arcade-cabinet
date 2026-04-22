import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const usePagesBase =
  process.env.USE_CI === "true" ||
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: usePagesBase ? "/arcade-cabinet/" : "/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
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
      "react-router-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/rapier",
      "framer-motion",
      "koota",
      "lucide-react",
      "simplex-noise",
    ],
  },
});
