import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.cabinet",
  appName: "Arcade Cabinet",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
