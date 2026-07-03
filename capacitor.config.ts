import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bessel.prefud",
  appName: "Prefud",
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
    CapacitorHttp: {
      enabled: true, 
    },
    FirebaseAnalytics: {
      enabled: true,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["apple.com", "google.com"],
    }
  },
  server: {
    androidScheme: "https", // Esto cambia el Origin a https://localhost
    hostname: "localhost"
  }
};

export default config;
