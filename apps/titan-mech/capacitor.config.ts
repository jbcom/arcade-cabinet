import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.titanmech",
  appName: "Titan Mech",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
