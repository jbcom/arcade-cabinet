import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export const baseViteConfig = {
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-app",
  },
};
