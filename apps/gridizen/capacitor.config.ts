import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.gridizen",
  appName: "Gridizen",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
