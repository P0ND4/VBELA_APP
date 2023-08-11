import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { verifyPhoneNumber } from "@api";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import ButtonStyle from "@components/ButtonStyle";
import countries from "@countries.json";
import CountriesImages from "@assets/countries";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

import * as localization from "expo-localization";
import * as WebBrowser from "expo-web-browser";

const light = theme.colors.light;
const dark = theme.colors.dark;

const EmailAndPhone = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const [value, setValue] = useState("");
  const [phoneNumberVisible, setPhoneNumberVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState({ state: false, button: null });

  const [filter, setFilter] = useState("");

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

  //TODO Terminar registro de telefono y correo
  //TODO Controlar el uso excesivo de mensajes y llamadas una variable en redux para manejar el whatsapp, msm y llamadas

  useEffect(() => {
    const keyword = filter.toLocaleLowerCase().replace("+", "");

    if (keyword.length === 0) setData(countries);
    else {
      const filteredData = countries.filter((c) =>
        ["country_name", "country_short_name", "country_phone_code"].some(
          (field) => String(c[field]).toLowerCase().includes(keyword)
        )
      );

      setData(filteredData);
    }
  }, [filter]);

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
          Keyboard.dismiss();
          if (
            /^[0-9]{7,20}$/.test(value) &&
            (!loading.state || loading.button === channel)
          ) {
            const phoneNumber = `+${selection.country_phone_code}${value}`;
            setLoading({ state: true, button: channel });
            /*const res = await verifyPhoneNumber({
              phoneNumber,
              channel
            });*/

            setTimeout(() => {
              setLoading({ state: false, button: null });
              navigation.navigate("Verification", { value: phoneNumber, type: 'phone' });
            }, 1000);
            //if (res.error) return Alert.alert("Error","Hubo un fallo al enviar la verificación");
          }
        }}
        style={[
          styles.phoneNumberButton,
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
            size={20}
            style={{ marginLeft: 10 }}
          />
        )}
      </ButtonStyle>
    );
  };

  const Country = React.memo(({ item }) => {
    return (
      <TouchableOpacity
        style={[
          {
            paddingVertical: 8,
          },
          styles.row,
        ]}
        onPress={() => {
          setSelection(item);
          setPhoneNumberVisible(!phoneNumberVisible);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={CountriesImages[item.country_short_name.toLowerCase()]}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <TextStyle
            color={mode === "light" ? light.textDark : dark.textWhite}
            customStyle={{ marginLeft: 10 }}
            smallParagraph
          >
            {item.country_name}
          </TextStyle>
        </View>
        <TextStyle
          color={mode === "light" ? light.textDark : dark.textWhite}
          smallParagraph
        >
          +{item.country_phone_code}
        </TextStyle>
      </TouchableOpacity>
    );
  });

  return (
    <Layout style={{ marginTop: 0 }}>
      <View>
        <TextStyle
          customStyle={{ marginBottom: 8 }}
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
          <TouchableOpacity
            style={[
              styles.flagButton,
              styles.row,
              { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
            ]}
            onPress={() => setPhoneNumberVisible(!phoneNumberVisible)}
          >
            {selection && (
              <Image
                source={
                  CountriesImages[selection?.country_short_name?.toLowerCase()]
                }
                style={{ width: 20, height: 20, borderRadius: 20 }}
              />
            )}
            <TextStyle
              customStyle={{ marginHorizontal: 5 }}
              color={mode === "light" ? light.textDark : dark.textWhite}
              smallParagraph
            >
              +{selection?.country_phone_code}
            </TextStyle>
            <Ionicons
              name={phoneNumberVisible ? "caret-up" : "caret-down"}
              color={
                mode === "light" ? `${light.textDark}66` : `${dark.textWhite}66`
              }
              size={15}
            />
          </TouchableOpacity>
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
        customStyle={{ marginBottom: 20 }}
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={phoneNumberVisible}
        onRequestClose={() => {
          setPhoneNumberVisible(!phoneNumberVisible);
          setFilter("");
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setPhoneNumberVisible(!phoneNumberVisible);
            setFilter("");
          }}
        >
          <View style={{ backgroundColor: "#0005", height: "42%" }} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.countriesContainer,
            {
              backgroundColor: mode === "light" ? light.main4 : dark.main1,
            },
          ]}
        >
          <View style={styles.row}>
            <TextStyle
              bigParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Seleccionar el código de zona
            </TextStyle>
            <TouchableOpacity
              onPress={() => {
                setPhoneNumberVisible(!phoneNumberVisible);
                setFilter("");
              }}
            >
              <Ionicons
                name="close"
                color={
                  mode === "light"
                    ? `${light.textDark}66`
                    : `${dark.textWhite}66`
                }
                size={30}
              />
            </TouchableOpacity>
          </View>
          <InputStyle
            left={() => (
              <Ionicons
                style={{ marginRight: 10 }}
                name="search"
                color={
                  mode === "light"
                    ? `${light.textDark}66`
                    : `${dark.textWhite}66`
                }
                size={30}
              />
            )}
            placeholder="Buscar"
            value={filter}
            onChangeText={(text) => setFilter(text)}
            stylesContainer={{ marginTop: 20, marginBottom: 15 }}
            stylesInput={{ maxWidth: "85%" }}
          />
          <FlatList
            data={data}
            windowSize={25}
            initialNumToRender={10}
            decelerationRate="fast"
            scrollSpeedMultiplier={0.5}
            keyExtractor={(item) => item.country_short_name}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <Country item={item} />}
          />
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  countriesContainer: {
    width: "100%",
    height: "60%",
    position: "absolute",
    bottom: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flagButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "30%",
  },
  phoneNumberButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

//133.20 MIOS EN EL BANCO
// 196.87 RAFAEL
// 207.37 CONVERTIDO
// MI GANANCIA EN COMISION 10.5
// LE DEBO A RAFAEL 26$

export default EmailAndPhone;
