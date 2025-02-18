import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { ConfigureGoogleSignin } from "config/auth/credentials";

export const GoogleAuthentication = async () => {
  try {
    ConfigureGoogleSignin();
    await GoogleSignin.hasPlayServices();
    return await GoogleSignin.signIn();
  } catch (error: any) {
    handleGoogleSignInError(error);
  }
};

export const signOutWithGoogle = async () => {
  try {
    ConfigureGoogleSignin();
    await GoogleSignin.signOut();
  } catch (error: any) {
    console.error("Error signing out:", error);
  }
};

const handleGoogleSignInError = (error: any) => {
  if (error.code) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        console.log("Sign-in was cancelled");
        break;
      case statusCodes.IN_PROGRESS:
        console.log("Sign-in is already in progress");
        break;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        console.log("Play services not available or outdated");
        break;
      default:
        console.log("Some other error:", error);
    }
  } else {
    console.error("An unknown error occurred:", error);
  }
};
