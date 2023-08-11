import { useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { change as changeUser } from "@features/user/informationSlice";
import { change as changeMode } from "@features/settings/modeSlice";
import { editUser } from "@api";

import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";

import Logo from "@assets/icon.png";

import * as WebBrowser from "expo-web-browser";

import theme from "@theme";
import TextStyle from "@components/TextStyle";
import { languageCodes } from "@helpers/libs";

const light = theme.colors.light;
const dark = theme.colors.dark;

const HEIGHT_SCREEN = Dimensions.get("screen").height;

const Setting = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const language = useSelector((state) => state.language);
  const user = useSelector((state) => state.user);
//TODO TERMINAR CONFIGURACION
  const timerChangeMode = useRef();

  const dispatch = useDispatch();

  const changeModeState = async () => {
    clearTimeout(timerChangeMode.current);

    const newMode = mode === "light" ? "dark" : "light";
    dispatch(changeMode(newMode));

    timerChangeMode.current = setTimeout(async () => {
      if (user.mode !== newMode) {
        dispatch(changeUser({ ...user, mode: newMode }));
        await editUser({ email: user.email, change: { mode: newMode } });
      }
    }, 1000);
  };

  const Card = ({ left, right, onPress }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderBottomColor:
              mode === "light" ? light.textDark : dark.textWhite,
          },
        ]}
        onPress={onPress}
      >
        {left()}
        {right()}
      </TouchableOpacity>
    );
  };

  return (
    <Layout style={{ marginTop: 0, padding: 0, paddingHorizontal: 20 }}>
      <ScrollView
        style={{ maxHeight: HEIGHT_SCREEN / 1.15 }}
        showsVerticalScrollIndicator={false}
      >
        <Card
          onPress={() => changeModeState()}
          left={() => (
            <Ionicons
              name={mode === "light" ? "moon" : "sunny"}
              size={35}
              color={light.main2}
            />
          )}
          right={() => (
            <TextStyle
              paragrahp
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {mode === "light" ? "DIURNO" : "NOCTURNO"}
            </TextStyle>
          )}
        />
        <Card
          onPress={() => navigation.navigate("Wifi")}
          left={() => <Ionicons name="wifi" size={35} color={light.main2} />}
          right={() => (
            <View style={styles.rowcenter}>
              <TextStyle
                paragrahp
                customStyle={{ marginRight: 10 }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                WIFI
              </TextStyle>
              <Ionicons
                name="chevron-forward-outline"
                size={28}
                color={light.main2}
              />
            </View>
          )}
        />
        <Card
          onPress={() => navigation.navigate("ClientSupplier")}
          left={() => <Ionicons name="people" size={35} color={light.main2} />}
          right={() => (
            <View style={styles.rowcenter}>
              <TextStyle
                paragrahp
                customStyle={{ marginRight: 10 }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Cliente y proveedor
              </TextStyle>
              <Ionicons
                name="chevron-forward-outline"
                size={28}
                color={light.main2}
              />
            </View>
          )}
        />
        <Card
          onPress={() => {}}
          left={() => <Ionicons name="shield" size={35} color={light.main2} />}
          right={() => (
            <View style={styles.rowcenter}>
              <TextStyle
                paragrahp
                customStyle={{ marginRight: 10 }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Privacidad y seguridad
              </TextStyle>
              <Ionicons
                name="chevron-forward-outline"
                size={28}
                color={light.main2}
              />
            </View>
          )}
        />
        <Card
          onPress={() => {}}
          left={() => <Ionicons name="globe" size={35} color={light.main2} />}
          right={() => (
            <TextStyle
              paragrahp
              customStyle={{ marginRight: 10 }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Idioma ({languageCodes.find((l) => l.code === language).name})
            </TextStyle>
          )}
        />
        <Card
          onPress={() => {}}
          left={() => (
            <Ionicons name="color-palette" size={35} color={light.main2} />
          )}
          right={() => (
            <TextStyle
              paragrahp
              customStyle={{ marginRight: 10 }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Temas
            </TextStyle>
          )}
        />
        <Card
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://chat.whatsapp.com/G0Hiyr2ZcsG5wzY2Txo5Qm"
            )
          }
          left={() => (
            <Ionicons name="logo-whatsapp" size={35} color={light.main2} />
          )}
          right={() => (
            <View>
              <TextStyle right paragrahp color={light.main2}>
                whatsapp
              </TextStyle>
              <TextStyle
                verySmall
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Ingresa a nuestro grupo de whatsapp
              </TextStyle>
            </View>
          )}
        />
        <Card
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://sites.google.com/view/politica-de-privacidad-vbela/principal"
            )
          }
          left={() => (
            <Ionicons name="document" size={35} color={light.main2} />
          )}
          right={() => (
            <TextStyle
              paragrahp
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Política de privacidad
            </TextStyle>
          )}
        />
        <Card
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://sites.google.com/view/terminos-y-condiciones-vbela/inicio"
            )
          }
          left={() => <Ionicons name="book" size={35} color={light.main2} />}
          right={() => (
            <TextStyle
              paragrahp
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Términos y condiciones
            </TextStyle>
          )}
        />
        <Card
          onPress={async () => {}}
          left={() => (
            <Ionicons name="chatbubbles" size={35} color={light.main2} />
          )}
          right={() => (
            <TextStyle
              paragrahp
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Contacto
            </TextStyle>
          )}
        />
        <Card
          onPress={async () => {}}
          left={() => <Ionicons name="heart" size={35} color={light.main2} />}
          right={() => (
            <TextStyle
              paragrahp
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Donación
            </TextStyle>
          )}
        />
        <Card
          onPress={async () => {}}
          left={() => (
            <Ionicons name="alert-circle" size={35} color={light.main2} />
          )}
          right={() => (
            <TextStyle
              paragrahp
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Información de la aplicación
            </TextStyle>
          )}
        />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    marginTop: 20,
  },
  rowcenter: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Setting;
