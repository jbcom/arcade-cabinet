import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.simsoviet",
  appName: "Sim Soviet 3000",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
