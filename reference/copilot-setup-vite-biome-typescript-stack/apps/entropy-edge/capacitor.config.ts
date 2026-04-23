import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.entropyedge",
  appName: "Entropy Edge",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
