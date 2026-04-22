import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.enchantedforest",
  appName: "Enchanted Forest Spirit",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
