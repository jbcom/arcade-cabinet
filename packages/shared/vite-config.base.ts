import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export const baseViteConfig = {
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-app",
  },
};
