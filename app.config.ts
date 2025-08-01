import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Fappture",
  description:
    "Fappture es una aplicación móvil desarrollada con React Native y Expo. Este proyecto está diseñado para proporcionar una experiencia de usuario fluida y eficiente en dispositivos Android.",
  slug: "vbela",
  version: process.env.EXPO_PUBLIC_VERSION ?? "4.0.0",
  platforms: ["android"],
  orientation: "portrait",
  icon: "./src/presentation/assets/logo.png",
  userInterfaceStyle: "automatic",
  splash: {
    backgroundColor: "#FFFFFF",
  },
  updates: {
    url: "https://u.expo.dev/0dd838a6-95db-4883-9a7f-7e6112496cd0",
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: "appVersion",
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
    package: "com.app.vbela",
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./src/presentation/assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./src/presentation/assets/favicon.png",
  },
  plugins: [
    "expo-font",
    ["@react-native-google-signin/google-signin"],
    [
      "expo-notifications",
      {
        icon: "./src/presentation/assets/notification-icon.png",
        color: "#222831",
      },
    ],
    "expo-localization",
    [
      "expo-secure-store",
      {
        configureAndroidBackup: true,
        faceIDPermission: "Allow Fappture to access your Face ID biometric data.",
      },
    ],
  ],
  notification: {
    androidMode: "default",
    icon: "./src/presentation/assets/notification-icon.png",
  },
  extra: { eas: { projectId: "0dd838a6-95db-4883-9a7f-7e6112496cd0" } },
  owner: "lmacml",
  experiments: {
    tsconfigPaths: true,
  },
});
