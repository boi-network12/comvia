import "dotenv/config";

/** @type {import("expo/config").ExpoConfig} */
export default {
  expo: {
    name: "Comvia",
    slug: "comvia",
    version: "1.0.0",
    scheme: "comvia",

    ios: {
      bundleIdentifier: "com.comvia.app",
    },

    android: {
      package: "com.comvia.app",
    },

    plugins: ["expo-router"],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      apiUrl: process.env.API_URL,
      wsUrl: process.env.WS_URL,

      eas: {
        projectId: "cca9bd8f-5b37-4df1-821b-6819fb3d3900",
      },
    },
  },
};