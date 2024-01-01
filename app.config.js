export default {
  expo: {
    name: "VBELA",
    slug: "vbela",
    version: "3.5.2",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1D1E1F",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    jsEngine: "hermes",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.app.vbela",
      entitlements: {
        "com.apple.developer.networking.wifi-info": true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#222831",
        },
      ],
      "expo-localization",
    ],
    notification: {
      androidMode: "default",
      icon: "./assets/notification-icon.png",
    },
    scheme: ["vbela", "fb1235340873743796"],
    android: {
      googleServicesFile: process.env.EXPO_PUBLIC_GOOGLE_SERVICES,
      package: "com.app.vbela",
      versionCode: 52,
    },
    extra: { eas: { projectId: "0dd838a6-95db-4883-9a7f-7e6112496cd0" } },
    owner: "lmacml",
  },
};
