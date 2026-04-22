import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.protocolsnw",
  appName: "Protocol: SNW",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
