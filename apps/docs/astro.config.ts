import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const usePagesBase =
  process.env.USE_CI === "true" ||
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  site: "https://jbcom.github.io",
  base: usePagesBase ? "/arcade-cabinet" : "/",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      conditions: ["development", "browser"],
    },
  },
  experimental: {
    // Disable the experimental bundler which is currently causing rolldown panics with tailwind
    clientPrerender: true,
  },
  output: "static",
});
