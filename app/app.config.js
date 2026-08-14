import "dotenv/config";

/** @type {import("expo/config").ExpoConfig} */
export default {
  expo: {
    name: "Comvia",
    slug: "comvia",
    version: "1.0.0",

    orientation: "portrait",
    scheme: "comvia",

    icon: "./assets/images/icon.png",

    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    description:
      "Comvia is a mobile application that provides users with a seamless and intuitive experience for managing their daily tasks and activities.",

    owner: "comvia",

    runtimeVersion: {
      policy: "appVersion",
    },

    updates: {
      url: "https://u.expo.dev/cca9bd8f-5b37-4df1-821b-6819fb3d3900",
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.comvia.app",
      buildNumber: "3",

      config: {
        usesNonExemptEncryption: false,
      },
    },

    android: {
      package: "com.comvia.app",
      versionCode: 3,

      adaptiveIcon: {
        foregroundImage:
          "./assets/images/android-icon-foreground.png",
        backgroundColor: "#ffffff",
        monochromeImage:
          "./assets/images/android-icon-foreground.png",
      },

      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,

      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACTIVITY_RECOGNITION",
        "android.permission.BODY_SENSORS",
      ],

      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",

      meta: {
        themeColor: "#ffffff",
        description:
          "Comvia — stay organized, productive, and connected.",
      },
    },

    plugins: [
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Roboto-Regular.ttf",
            "./assets/fonts/Roboto-Medium.ttf",
            "./assets/fonts/Roboto-Bold.ttf",
            "./assets/fonts/Roboto-Light.ttf",
          ],
        },
      ],

      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
          faceIDPermission:
            "Allow Comvia to access your Face ID biometric data.",
        },
      ],

      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 220,
          resizeMode: "contain",
          backgroundColor: "#E6F4FE",

          dark: {
            backgroundColor: "#0A1D37",
            image: "./assets/images/splash-icon.png",
          },
        },
      ],

      "expo-router",
      "expo-web-browser",
      "expo-image-picker",
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    assetBundlePatterns: ["**/*"],

    extra: {
      apiUrl: process.env.API_URL,
      wsUrl: process.env.WS_URL,

      eas: {
        projectId: "cca9bd8f-5b37-4df1-821b-6819fb3d3900",
      },
    },
  },
};