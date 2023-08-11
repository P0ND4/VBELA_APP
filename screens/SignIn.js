import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  Platform,
  Animated,
  TouchableOpacity,
} from "react-native";
import { change as changeMode } from "@features/settings/modeSlice";
import { change as changeUser } from "@features/user/informationSlice";
import { change as changeHelper } from "@features/helpers/informationSlice";
import { change as changeSettings } from "@features/settings/settingsSlice";
import { change as changeLanguage } from "@features/settings/languageSlice";
import { active } from "@features/user/sessionSlice";
import { addUser } from "@api";
import axios from "axios";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import ButtonStyle from "@components/ButtonStyle";

import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import theme from "@theme";
import Donut from "@components/Donut";
import changeGeneralInformation from "@helpers/changeGeneralInformation";

import Ionicons from "@expo/vector-icons/Ionicons";

// IMAGES
import Welcome from "@assets/login/welcome.png";
import KitchenAndReservations from "@assets/login/kitchen_and_reservations.png";
import Teamwork from "@assets/login/teamwork.png";
import EasyToUse from "@assets/login/easy_to_use.png";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width, height } = Dimensions.get("screen");

WebBrowser.maybeCompleteAuthSession();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#EEEEEE",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Hubo un error al obtener el token de la push notifications!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "0dd838a6-95db-4883-9a7f-7e6112496cd0",
      })
    ).data;
    console.log(token);
  } else {
    alert(
      "Debe usar un dispositivo físico para las notificaciones automáticas"
    );
  }

  return token;
}


const SignIn = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);

  const [percentage, setPercentage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [facebookRequest, facebookResponse, facebookPromptAsync] =
    Facebook.useAuthRequest({
      clientId: process.env.CLIENT_ID || process.env.EXPO_PUBLIC_CLIENT_ID,
    });

  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      iosClientId: process.env.IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      androidClientId: process.env.ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    });

  const dispatch = useDispatch();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
  }, []);

  useEffect(() => {
    if (
      facebookResponse &&
      facebookResponse.type === "success" &&
      facebookResponse.authentication
    ) {
      (async () => {
        setModalVisible(true);
        setPercentage(20);
        const response = await axios.get(
          `https://graph.facebook.com/me?access_token=${facebookResponse.authentication.accessToken}&fields=id,name,email`
        );

        setPercentage(40);
        sendInformation(response);
      })();
    }
  }, [facebookResponse]);

  useEffect(() => {
    if (
      googleResponse &&
      googleResponse.type === "success" &&
      googleResponse.authentication
    ) {
      (async () => {
        setModalVisible(true);
        setPercentage(25);
        const response = await axios.get(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization: `Bearer ${googleResponse.authentication.accessToken}`,
            },
          }
        );

        setPercentage(50);
        sendInformation(response);
      })();
    }
  }, [googleResponse]);

  const facebookHandlePressAsync = async () => {
    const result = await facebookPromptAsync();
    if (result.type !== "success") {
      alert("Hubo un problema al iniciar sesión con Facebook");
      return;
    }
  };

  const googleHandlePessAsync = async () => {
    const result = await googlePromptAsync();
    if (result.type !== "success") {
      alert("Hubo un problema al iniciar sesión con Google");
      return;
    }
  };

  const sendInformation = async (response) => {
    const email = response.data.email;
    let data = await addUser({ email, expoID: expoPushToken });

    if (data.error && data.details === "api") {
      setModalVisible(false);
      setPercentage(0);
      return alert("Ha ocurrido un problema al iniciar sesión");
    }

    const error = data.error;
    const user = data.response;

    dispatch(changeMode(error ? user.mode : data.mode));
    changeGeneralInformation(dispatch, error ? user : data);
    dispatch(changeUser(error ? user : data));
    dispatch(
      changeLanguage(error ? user.settings.language : data.settings.language)
    );
    dispatch(changeSettings(error ? user.settings : data.settings));
    dispatch(changeHelper(error ? user.helpers : data.helpers));

    setPercentage(100);
    setTimeout(() => {
      dispatch(active());
      navigation.replace("App");
    }, 1000);
  };

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(1)).current;

  //   Information for each login animation layout
  const DATA = [
    {
      key: "welcome",
      title: "¡Bienvenido/a a VBELA!",
      description: "Gestiona y administra tus alquileres fácilmente.",
      image: Welcome,
    },
    {
      key: "kitchen_and_reservations",
      title: "¡Todo en uno!",
      description:
        "Controla tu negocio de alquileres y restaurante desde una sola aplicación. ¡Simplifica tus operaciones y aumenta la eficiencia con VBELA!",
      image: KitchenAndReservations,
    },
    {
      key: "teamwork",
      title: "¡Trabaja en equipo con VBELA!",
      description:
        "Nuestra aplicación te permite sincronizar tus datos en tiempo real, colaborar con tu equipo y trabajar en modo offline. Ya sea que estés trabajando en el campo o en la oficina, VBELA te mantiene conectado y productivo.",
      image: Teamwork,
    },
    {
      key: "easy_to_use",
      title: "¡Olvídate de la complejidad!",
      description:
        "Nuestra aplicación es fácil de usar e intuitiva, lo que te permitirá enfocarte en lo que realmente importa: hacer crecer tu negocio.",
      image: EasyToUse,
    },
  ];

  const Indicator = ({ scrollX }) => {
    return (
      <View style={{ position: "relative", bottom: 40, flexDirection: "row" }}>
        {DATA.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: i,
                animated: true
              })
            }} key={`indicator-${i}`}>
              <Animated.View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: light.main2,
                  opacity,
                  margin: 10,
                  transform: [
                    {
                      scale,
                    },
                  ],
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const Backdrop = () => {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: mode === "light" ? "#FFFFFF" : dark.main1,
          },
        ]}
      />
    );
  };

  const Square = ({ scrollX }) => {
    const YOLO = Animated.modulo(
      Animated.divide(
        Animated.modulo(scrollX, width),
        new Animated.Value(width)
      ),
      1
    );

    const rotate = YOLO.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["35deg", "0deg", "35deg"],
    });

    const translateX = YOLO.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -height, 0],
    });

    return (
      <Animated.View
        style={{
          width: height,
          height: height,
          backgroundColor: light.main2,
          borderRadius: 86,
          position: "absolute",
          top: -height * 0.64,
          left: -height * 0.33,
          transform: [
            {
              rotate,
            },
            {
              translateX,
            },
          ],
        }}
      />
    );
  };

  return (
    <Layout
      style={{
        flex: 1,
        marginTop: 0,
        padding: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Backdrop />
      <Square scrollX={scrollX} />
      <Animated.FlatList
        ref={flatListRef}
        data={DATA}
        key={(item) => item.key}
        horizontal
        scrollEventThrottle={32}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <View style={{ width, alignItems: "center", padding: 20 }}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Image
                  source={item.image}
                  style={{
                    width: width / 1.5,
                    height: width / 1.5,
                    resizeMode: "contain",
                  }}
                />
              </View>
              <View style={{ flex: 0.22 }}>
                <TextStyle
                  color={light.main2}
                  subtitle
                  customStyle={{ marginBottom: 10, fontWeight: 800 }}
                >
                  {item.title}
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                  customStyle={{ fontWeight: "300" }}
                  smallParagraph
                >
                  {item.description}
                </TextStyle>
              </View>
            </View>
          );
        }}
      />
      <View style={{ alignItems: "center" }}>
        <TextStyle
          color={mode === "light" ? light.textDark : dark.textWhite}
          customStyle={{ marginBottom: 15 }}
        >
          --------------- Inicia sesión con ---------------
        </TextStyle>
        <View style={{ flexDirection: "row", paddingBottom: 85 }}>
          <View style={{ alignItems: 'center' }}>
            <ButtonStyle
              style={[styles.button, { backgroundColor: '#F7F220' }]}
              disable={!googleRequest}
              onPress={() => googleHandlePessAsync()}
              backgroundColor={mode === "dark" ? dark.main2 : light.main5}
            >
              <Ionicons
                name="logo-google"
                size={38}
                style={styles.icons}
              />
            </ButtonStyle>
            <TextStyle smallParagraph color={mode === 'light' ? light.textDark : dark.textWhite}>Google</TextStyle>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ButtonStyle
              style={[styles.button, { backgroundColor: "#1F7BF2" }]}
              disable={!facebookRequest}
              onPress={() => facebookHandlePressAsync()}
              backgroundColor={mode === "dark" ? dark.main2 : light.main5}
            >
              <Ionicons
                name="logo-facebook"
                color="#FFFFFF"
                size={38}
                style={styles.icons}
              />
            </ButtonStyle>
            <TextStyle smallParagraph color={mode === 'light' ? light.textDark : dark.textWhite}>Facebook</TextStyle>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ButtonStyle
              style={[styles.button, { backgroundColor: '#22D847' }]}
              onPress={() => navigation.navigate('EmailAndPhone', { type: 'phone' })}
              backgroundColor={mode === "dark" ? dark.main2 : light.main5}
            >
              <Ionicons
                name="call"
                size={38}
                color="#FFFFFF"
                style={styles.icons}
              />
            </ButtonStyle>
            <TextStyle smallParagraph color={mode === 'light' ? light.textDark : dark.textWhite}>Teléfono</TextStyle>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ButtonStyle
              style={[styles.button, { backgroundColor: "#EB493A" }]}
              onPress={() => navigation.navigate('EmailAndPhone', { type: 'email' })}
              backgroundColor={mode === "dark" ? dark.main2 : light.main5}
            >
              <Ionicons
                name="mail"
                color="#FFFFFF"
                size={38}
                style={styles.icons}
              />
            </ButtonStyle>
            <TextStyle smallParagraph color={mode === 'light' ? light.textDark : dark.textWhite}>Correo</TextStyle>
          </View>
        </View>
      </View>
      <Indicator scrollX={scrollX} />
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
  button: {
    width: 'auto',
    width: 60,
    height: 60,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default SignIn;