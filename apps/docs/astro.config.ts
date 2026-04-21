import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jbcom.github.io",
  base: "/arcade-cabinet",
  integrations: [react(), sitemap()],
  output: "static",
});
