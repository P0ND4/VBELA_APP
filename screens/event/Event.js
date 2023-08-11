import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { View, StyleSheet, Image } from "react-native";
import { getRule } from "@api";
import Layout from "@components/Layout";
import Block from "@assets/block.png";
import Update from "@assets/adaptive-icon.png";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import * as WebBrowser from "expo-web-browser";

import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Event = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const session = useSelector((state) => state.session);
  const [m, setM] = useState(route.params.mode);
  const [reload, setReload] = useState(false);

  const timer = useRef();

  useEffect(() => {
    clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const res = await getRule();

      if (!res.error) {
        if (res.block) return setM("blocked");
        if (res.version.detail !== process.env.EXPO_PUBLIC_VERSION)
          return setM("update");

        navigation.replace(!session ? "SignIn" : "Home");
      } else navigation.replace(!session ? "SignIn" : "Home");
    }, 1500);

    return () => setReload(false);
  }, [reload]);

  if (m === "update") {
    return (
      <Layout style={styles.layout}>
        <View>
          <Image
            source={Update}
            style={{
              width: 200,
              height: 200,
              borderRadius: 16,
            }}
          />
          <TextStyle
            color={light.main2}
            center
            bigParagraph
            customStyle={{ marginTop: 15 }}
          >
            V {route.params.version}
          </TextStyle>
        </View>
        <View style={{ paddingHorizontal: 4, marginVertical: 30 }}>
          <TextStyle color={light.main2} smallSubtitle center>
            NUEVA VERSIÓN DISPONIBLE
          </TextStyle>
          <TextStyle
            color={mode === "light" ? light.textDark : dark.textWhite}
            justify
            smallParagraph
          >
            !Hola querido usuario! estás usando una versión que actualmente se
            encuentra obsoleta y es necesaria su actualización, las
            actualizaciones traen mejoras, arreglos de bugs o errores,
            implementación de nuevos servicios y mucho más para que pueda
            apreciar se la mejor manera a VBELA, si no es necesaria la
            actualización no te aparecerá esta ventana
          </TextStyle>
        </View>
        <ButtonStyle
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://play.google.com/store/apps/details?id=com.app.vbela"
            )
          }
          backgroundColor={light.main2}
          style={{ width: "60%", marginTop: 10 }}
        >
          <TextStyle center>Actualizar VBELA</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }

  if (m === "blocked") {
    return (
      <Layout style={styles.layout}>
        <Image
          source={Block}
          style={{
            width: 380,
            height: 270,
          }}
        />
        <View style={{ paddingHorizontal: 4, marginVertical: 30 }}>
          <TextStyle color={light.main2} smallSubtitle center>
            EN MANTENIMIENTO
          </TextStyle>
          <TextStyle
            color={mode === "light" ? light.textDark : dark.textWhite}
            justify
            smallParagraph
          >
            Estamos realizando algunos cambios urgentes en la aplicación, esto
            puede demorar algunos minutos, esto suele pasar cuando el servidor
            está caído, o hay problemas graves en el código de la aplicación,
            esto requiere el bloqueo de la manipulación de datos en la
            aplicación temporalmente, disculpe las molestias ocasionadas :(
          </TextStyle>
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          style={{ width: "60%" }}
          onPress={() => setReload(true)}
        >
          <TextStyle center>Refrescar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }
};

const styles = StyleSheet.create({
  layout: { justifyContent: "center", alignItems: "center" },
});

export default Event;