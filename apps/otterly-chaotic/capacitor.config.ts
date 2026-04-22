import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.otterlychaotic",
  appName: "Otterly Chaotic",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
