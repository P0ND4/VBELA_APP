import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Fappture",
  description:
    "Fappture es una aplicación móvil desarrollada con React Native y Expo. Este proyecto está diseñado para proporcionar una experiencia de usuario fluida y eficiente en dispositivos Android.",
  slug: "vbela",
  version: process.env.EXPO_PUBLIC_VERSION ?? "4.0.0-beta.1",
  platforms: ["android"],
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
    package: "com.app.vbela",
    versionCode: 67,
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
