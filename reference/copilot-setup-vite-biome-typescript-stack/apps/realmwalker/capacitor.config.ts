import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.realmwalker",
  appName: "Realmwalker",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
