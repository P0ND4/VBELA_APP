import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, StyleSheet, Image, Modal, Dimensions } from "react-native";
import { change as changeMode } from "../features/settings/modeSlice";
import { change as changeUser } from "../features/user/informationSlice";
import { change as changeHelper } from "../features/helpers/informationSlice";
import { active } from "../features/user/sessionSlice";
import { addUser } from "../api";
import axios from "axios";
import TextStyle from "../components/TextStyle";
import Layout from "../components/Layout";
import ButtonStyle from "../components/ButtonStyle";

import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AuthSession from "expo-auth-session";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import FacebookIcon from "../assets/icons/facebook-light.png";
import GoogleIcon from "../assets/icons/google-light.png";

import theme from "../theme";
import Donut from "../components/Donut";
import changeGeneralInformation from "../helpers/changeGeneralInformation";

const light = theme.colors.light;
const dark = theme.colors.dark;

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const SignInScreen = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);

  const [percentage, setPercentage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [accessTokenFacebook, setAccessTokenFacebook] = useState(null);
  const [, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest(
    {
      clientId: "1235340873743796",
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    },
    { useProxy: true }
  );

  const [accessTokenGoogle, setAccessTokenGoogle] = useState(null);
  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId:
      "939036008047-ho0ql8cpdg2m0ju1ok48pb4fnsbcl61h.apps.googleusercontent.com",
    iosClientId:
      "939036008047-m8go6arfvej2qfbv1aku6c93fhmh7bqn.apps.googleusercontent.com",
    androidClientId:
      "939036008047-q9jbdtk7vb7m1p8ermfhugjt4nrlorvl.apps.googleusercontent.com",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    if (facebookResponse?.type === "success") {
      setAccessTokenFacebook(facebookResponse.authentication.accessToken);
      accessTokenFacebook && facebookRegister();
    }
  }, [facebookResponse, accessTokenFacebook]);

  useEffect(() => {
    if (googleResponse?.type === "success") {
      setAccessTokenGoogle(googleResponse.authentication.accessToken);

      accessTokenGoogle && googleRegister();
    }
  }, [googleResponse, accessTokenGoogle]);

  const facebookRegister = async () => {
    setModalVisible(true);
    setPercentage(20);
    const response = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessTokenFacebook}&fields=id,name,email`
    );

    setPercentage(40);
    sendInformation(response);
  };

  const googleRegister = async () => {
    setModalVisible(true);
    setPercentage(25);
    const response = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {
          Authorization: `Bearer ${accessTokenGoogle}`,
        },
      }
    );

    setPercentage(50);
    sendInformation(response);
  };

  const sendInformation = async (response) => {
    const email = response.data.email;
    let data = await addUser({ email, expoID: expoPushToken });

    if (data.error && data.details === 'api') {
      setModalVisible(false);
      return setPercentage(0);
    }

    const error = data.error;
    const user = data.response;

    dispatch(changeMode(error ? user.mode : data.mode));
    changeGeneralInformation(dispatch, error ? user : data);
    dispatch(changeUser(error ? user : data));
    dispatch(changeHelper(error ? user.helpers : data.helpers));

    setPercentage(100);
    setTimeout(() => {
      dispatch(active());
      navigation.replace("Home");
    }, 1000);
  };

  return (
    <Layout style={theme.styles.containerCenter}>
      <TextStyle bigTitle color={light.main2}>
        VBELA
      </TextStyle>
      <TextStyle smallTitle color={mode === "light" ? null : dark.textWhite}>
        Bienvenido
      </TextStyle>
      <View style={styles.buttonContainer}>
        <ButtonStyle
          onPress={() => googlePromptAsync()}
          backgroundColor={mode === "dark" ? dark.main2 : light.main5}
        >
          <Image
            source={GoogleIcon}
            style={{
              width: Math.floor(width / 13),
              height: Math.floor(height / 38),
            }}
          />{" "}
          <TextStyle color={mode === "dark" ? light.main4 : light.textDark}>
            GOOGLE
          </TextStyle>
        </ButtonStyle>
        <ButtonStyle
          onPress={() => facebookPromptAsync()}
          backgroundColor={mode === "dark" ? dark.main2 : light.main5}
        >
          <Image
            source={FacebookIcon}
            style={{
              width: Math.floor(width / 16),
              height: Math.floor(height / 38),
            }}
          />{" "}
          <TextStyle color={mode === "dark" ? light.main4 : light.textDark}>
            ACEBOOK
          </TextStyle>
        </ButtonStyle>
      </View>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor:
              mode === "light" ? `${light.main4}FF` : `${dark.main1}FF`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Donut color={light.main2} percentage={percentage} />
          <TextStyle
            bigParagraph
            color={mode === "dark" ? dark.textWhite : light.textDark}
            customStyle={{ marginTop: 15 }}
          >
            {percentage === 25
              ? "ESTABLECIENDO CONEXIÓN"
              : percentage === 50
              ? "VALIDANDO CORREO"
              : percentage === 100
              ? "INICIANDO SESIÓN"
              : ""}
          </TextStyle>
          <TextStyle smallParagraph color={light.main2}>
            POR FAVOR ESPERE
          </TextStyle>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    marginTop: 50,
  },
});

export default SignInScreen;
