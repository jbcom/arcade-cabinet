import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.cosmicgardener",
  appName: "Cosmic Gardener",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
