import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.bioluminescentsea",
  appName: "Bioluminescent Sea",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
