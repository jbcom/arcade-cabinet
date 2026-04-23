import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.reachforthesky",
  appName: "Reach for the Sky",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
