import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bessel.mypantryapp",
  appName: "Pantry AI",
  webDir: "dist",
  android: {
    // Enable edge-to-edge display and respect system insets
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
    },
  },
};

export default config;
