import "ts-node/register"; // Add this to import TypeScript files
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "VBELA",
  slug: "vbela",
  version: "4.0.0-beta.4",
  orientation: "portrait",
  icon: "./src/presentation/assets/logo.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/presentation/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1D1E1F",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.app.vbela",
    infoPlist: {
      UIBackgroundModes: ["fetch"],
    },
    entitlements: {
      "com.apple.developer.networking.wifi-info": true,
    },
  },
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    // package: "com.app.vbela",
    // versionCode: 68,
    adaptiveIcon: {
      foregroundImage: "./src/presentation/assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./src/presentation/assets/favicon.png",
  },
  plugins: [
    ["@react-native-google-signin/google-signin"],
    [
      "expo-notifications",
      {
        icon: "./src/presentation/assets/notification-icon.png",
        color: "#222831",
      },
    ],
    "expo-localization",
  ],
  notification: {
    androidMode: "default",
    icon: "./src/presentation/assets/notification-icon.png",
  },
  scheme: ["vbela", "fb1235340873743796"],
  extra: { eas: { projectId: "0dd838a6-95db-4883-9a7f-7e6112496cd0" } },
  owner: "lmacml",
  experiments: {
    tsconfigPaths: true,
  },
};

export default config;
