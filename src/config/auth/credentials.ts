import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const ConfigureGoogleSignin = () =>
  GoogleSignin.configure({
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
    profileImageSize: 150,
  });
