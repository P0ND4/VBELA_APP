import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { verifyPhoneNumber, verifyEmail } from "@api";
import { getFontSize } from '@helpers/libs';
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import ButtonStyle from "@components/ButtonStyle";
import countries from "@countries.json";
import Ionicons from "@expo/vector-icons/Ionicons";
import PickerPhoneNumber from "@components/PickerPhoneNumber";
import FlagButton from "@components/FlagButton";
import theme from "@theme";

import * as localization from "expo-localization";
import * as WebBrowser from "expo-web-browser";

const { light, dark } = theme();

const EmailAndPhone = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const [value, setValue] = useState("");
  const [phoneNumberVisible, setPhoneNumberVisible] = useState(false);
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState({ state: false, button: null });

  const type = route.params.type;

  useEffect(() => {
    const regionCode = localization.getLocales()[0].regionCode;
    const found = countries.find((c) => c.country_short_name === regionCode);
    if (found) setSelection(found);
    else
      setSelection({
        country_name: "Estados Unidos",
        country_short_name: "US",
        country_phone_code: 1,
      });
  }, []);

  //TODO Controlar el uso excesivo de mensajes y llamadas una variable en redux para manejar el whatsapp, msm y llamadas

  useEffect(() => {
    navigation.setOptions({
      title: `Ingresar con: ${
        type === "email" ? "Correo electrónico" : "Número de teléfono"
      }`,
    });
  }, []);

  const PhoneButton = ({ name, icon, channel }) => {
    return (
      <ButtonStyle
        backgroundColor={
          channel === "whatsapp"
            ? "#22D847"
            : mode === "light"
            ? light.main5
            : dark.main2
        }
        onPress={async () => {
          if (loading.state) return;
          Keyboard.dismiss();
          if (/^[0-9]{7,20}$/.test(value) && !loading.state) {
            const phoneNumber = `+${selection.country_phone_code}${value}`;
            setLoading({ state: true, button: channel });
            const res = await verifyPhoneNumber({
              phoneNumber,
              channel,
            });
            setLoading({ state: false, button: null });
            if (res.error)
              return Alert.alert(
                "Error",
                `Hubo un fallo al enviar la verificación ${
                  res.message ? `de tipo: ${res.message}` : ""
                }`
              );
            navigation.navigate("Verification", {
              value: phoneNumber,
              type: "phone",
            });
          }
        }}
        style={[
          styles.button,
          {
            opacity:
              /^[0-9]{7,20}$/.test(value) &&
              (!loading.state || loading.button === channel)
                ? 1
                : 0.6,
          },
        ]}
      >
        {loading.state && loading.button === channel && (
          <ActivityIndicator
            size="small"
            color={
              channel === "whatsapp"
                ? "#FFFFFF"
                : mode === "light"
                ? light.textDark
                : dark.textWhite
            }
          />
        )}
        {(!loading.state || loading.button !== channel) && (
          <TextStyle
            color={
              channel === "whatsapp"
                ? "#FFFFFF"
                : mode === "light"
                ? light.textDark
                : dark.textWhite
            }
          >
            {name}
          </TextStyle>
        )}
        {(!loading.state || loading.button !== channel) && (
          <Ionicons
            name={icon}
            color={mode === "light" ? light.textDark : dark.textWhite}
            size={getFontSize(16)}
            style={{ marginLeft: 10 }}
          />
        )}
      </ButtonStyle>
    );
  };

  return (
    <Layout>
      <View>
        <TextStyle
          style={{ marginBottom: 8 }}
          bigSubtitle
          color={light.main2}
        >
          ¡HOLA!
        </TextStyle>
        <TextStyle
          smallParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Te ayudaremos a iniciar sesión con tu{" "}
          {type === "email" ? "correo electrónico" : "número de teléfono"} en 2
          pasos
        </TextStyle>
      </View>
      <View style={styles.row}>
        {type === "phone" && (
          <FlagButton
            onPress={() => setPhoneNumberVisible(!phoneNumberVisible)}
            arrow={phoneNumberVisible}
            selection={selection}
          />
        )}
        <InputStyle
          stylesContainer={{
            marginVertical: 20,
            width: type === "phone" ? "69%" : "100%",
          }}
          keyboardType={type === "email" ? "email-address" : "numeric"}
          maxLength={type === "email" ? 64 : 20}
          onChangeText={(text) => setValue(text)}
          placeholder={
            type === "email" ? "Correo electrónico" : "Número de teléfono"
          }
        />
      </View>
      <TextStyle
        style={{ marginBottom: 20 }}
        verySmall
        color={mode === "light" ? light.textDark : dark.textWhite}
      >
        Al iniciar sesión con una cuenta, acepta los{" "}
        <TextStyle
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://sites.google.com/view/terminos-y-condiciones-vbela/inicio"
            )
          }
          verySmall
          color={light.main2}
        >
          Términos de servicio
        </TextStyle>{" "}
        y la{" "}
        <TextStyle
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://sites.google.com/view/politica-de-privacidad-vbela/principal"
            )
          }
          verySmall
          color={light.main2}
        >
          Política de privacidad
        </TextStyle>{" "}
        de VBELA.
      </TextStyle>
      {type === "phone" && (
        <PhoneButton name="WhatsApp" icon="logo-whatsapp" channel="whatsapp" />
      )}
      {type === "phone" && (
        <PhoneButton name="SMS" icon="chatbox-outline" channel="sms" />
      )}
      {type === "phone" && (
        <PhoneButton name="Llamada" icon="call-outline" channel="call" />
      )}
      {type === "email" && (
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={async () => {
            Keyboard.dismiss();
            if (
              /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/.test(
                value
              ) &&
              !loading.state
            ) {
              setLoading({ state: true, button: "email" });
              const res = await verifyEmail({ email: value });
              setLoading({ state: false, button: null });
              if (res.error)
                return Alert.alert(
                  "Error",
                  "Hubo un fallo al enviar la verificación"
                );
              navigation.navigate("Verification", { value, type: "email" });
            }
          }}
          style={[
            styles.button,
            {
              opacity:
                /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/.test(
                  value
                ) &&
                (!loading.state || loading.button === "email")
                  ? 1
                  : 0.6,
            },
          ]}
        >
          {loading.state && loading.button === "email" && (
            <ActivityIndicator size="small" color={light.textDark} />
          )}
          {(!loading.state || loading.button !== "email") && (
            <TextStyle>Verificar</TextStyle>
          )}
          {(!loading.state || loading.button !== "email") && (
            <Ionicons
              name="mail"
              color={light.textDark}
              size={getFontSize(16)}
              style={{ marginLeft: 10 }}
            />
          )}
        </ButtonStyle>
      )}
      <PickerPhoneNumber
        modalVisible={phoneNumberVisible}
        setModalVisible={setPhoneNumberVisible}
        onChange={(item) => setSelection(item)}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EmailAndPhone;
