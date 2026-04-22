import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arcade.voxelrealms",
  appName: "Voxel Realms",
  webDir: "dist-app",
  server: {
    androidScheme: "https",
  },
};

export default config;
