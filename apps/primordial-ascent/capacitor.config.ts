import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.primordialascent",
  appName: "Primordial Ascent",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
