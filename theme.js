import Constants from "expo-constants";

export default {
  colors: {
    light: {
      main1: "#00FFF0",
      main2: "#00D1FF",
      main3: "#3D6CB9",
      main4: "#FAFAF6",
      main5: "#EEEEEE",
      textDark: "#444444",
    },
    dark: {
      main1: "#222831",
      main2: "#393E46",
      main3: "#00ADB5",
      main4: "#EEEEEE",
      textWhite: "#EEEEEE",
    },
  },
  styles: {
    default: {
      flex: 1,
      marginTop: Constants.statusBarHeight,
      padding: 20,
    },
    containerCenter: {
      justifyContent: "center",
      alignItems: "center",
    },
  },
};
