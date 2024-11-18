import React, { useEffect, useState, useCallback } from "react";
import { Keyboard, View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthNavigationProp } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import FlagButton from "presentation/components/button/FlagButton";
import PhoneNumberPicker from "presentation/components/forms/PhoneNumberPicker";
import { Country } from "domain/entities/shared/Country";
import countries from "shared/data/countries.json";

import * as localization from "expo-localization";
import * as WebBrowser from "expo-web-browser";

const PHONE_EXPRESSION = /^[0-9]{7,20}$/;
const TERMS_OF_SERVICE_URL = "https://sites.google.com/view/terminos-y-condiciones-vbela/inicio";
const PRIVACY_POLICY_URL = "https://sites.google.com/view/politica-de-privacidad-vbela/principal";

const termsOfService = async () => await WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL);
const privacyPolicy = async () => await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);

type CardStyles = {
  backgroundColor?: string;
  textColor?: string;
};

type Icons = "logo-whatsapp" | "chatbox-outline" | "call-outline";

type PhoneButtonProps = {
  cardStyles: CardStyles;
  name: string;
  icon: Icons;
  channel: string;
  disable: boolean;
  onPress: (channel: string) => Promise<void>;
};

const PhoneButton: React.FC<PhoneButtonProps> = ({
  cardStyles,
  name,
  icon,
  disable,
  channel,
  onPress,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <StyledButton
      backgroundColor={cardStyles.backgroundColor}
      onPress={async () => {
        Keyboard.dismiss();
        setLoading(true);
        await onPress(channel);
        setLoading(false);
      }}
      disable={disable}
      style={styles.center}
    >
      {loading && <ActivityIndicator size="small" color={cardStyles.textColor} />}
      {!loading && <StyledText color={cardStyles.textColor}>{name}</StyledText>}
      {!loading && (
        <Ionicons name={icon} color={cardStyles.textColor} size={20} style={{ marginLeft: 10 }} />
      )}
    </StyledButton>
  );
};

const PhoneSignIn: React.FC<AuthNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const [disable, setDisable] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [countrySelectionVisibleModal, setCountrySelectionVisibleModal] = useState<boolean>(false);
  const [countrySelection, setCountrySelection] = useState<Country>({
    country_name: "Estados Unidos",
    country_short_name: "US",
    country_phone_code: 1,
  });

  useEffect(() => {
    const regionCode = localization.getLocales()[0].regionCode;
    const found = countries.find((c) => c.country_short_name === regionCode);
    if (found) setCountrySelection(found);
  }, []);

  const handleButtonPress = useCallback(
    async (channel: string) => {
      const phoneNumber = `+${countrySelection.country_phone_code}${phone}`;

      navigation.navigate("PhoneVerification", { value: phoneNumber });
      // setDisable(true);
      // const res = await verifyPhoneNumber({
      //   phoneNumber,
      //   channel,
      // });
      // if (res.error)
      //   return Alert.alert(
      //     "Error",
      //     `Hubo un fallo al enviar la verificación ${res.message ? `de tipo: ${res.message}` : ""}`,
      //   );
      // navigation.navigate("Verification", { value: phoneNumber, type: "phone" });
    },
    [countrySelection, phone],
  );

  return (
    <Layout>
      <View>
        <StyledText style={{ marginBottom: 8 }} bigSubtitle color={colors.primary}>
          ¡HOLA!
        </StyledText>
        <StyledText smallParagraph>
          Te ayudaremos a iniciar sesión con tu número de teléfono en 2 pasos
        </StyledText>
      </View>
      <View style={{ flexDirection: "row", marginVertical: 10 }}>
        <FlagButton
          onPress={() => setCountrySelectionVisibleModal(!countrySelectionVisibleModal)}
          activate={countrySelectionVisibleModal}
          country={countrySelection}
        />
        <StyledInput
          keyboardType="numeric"
          maxLength={20}
          value={phone}
          onChangeText={(phone) => setPhone(phone)}
          placeholder="Número de teléfono"
        />
      </View>
      <StyledText style={{ marginBottom: 20 }} verySmall>
        Al iniciar sesión con una cuenta, acepta los{" "}
        <StyledText onPress={() => termsOfService()} verySmall color={colors.primary}>
          Términos de servicio
        </StyledText>{" "}
        y la{" "}
        <StyledText onPress={() => privacyPolicy()} verySmall color={colors.primary}>
          Política de privacidad
        </StyledText>{" "}
        de VBELA.
      </StyledText>
      <View>
        <PhoneButton
          name="WhatsApp"
          icon="logo-whatsapp"
          onPress={handleButtonPress}
          channel="whatsapp"
          cardStyles={{
            backgroundColor: "#22D847",
            textColor: "#FFFFFF",
          }}
          disable={disable || !PHONE_EXPRESSION.test(phone)}
        />
        <PhoneButton
          name="SMS"
          icon="chatbox-outline"
          onPress={handleButtonPress}
          channel="sms"
          cardStyles={{
            backgroundColor: colors.card,
            textColor: colors.text,
          }}
          disable={disable || !PHONE_EXPRESSION.test(phone)}
        />
        <PhoneButton
          name="Llamada"
          icon="call-outline"
          onPress={handleButtonPress}
          channel="call"
          cardStyles={{
            backgroundColor: colors.card,
            textColor: colors.text,
          }}
          disable={disable || !PHONE_EXPRESSION.test(phone)}
        />
      </View>
      <PhoneNumberPicker
        modalVisible={countrySelectionVisibleModal}
        setModalVisible={setCountrySelectionVisibleModal}
        onChange={(item) => setCountrySelection(item)}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  center: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PhoneSignIn;
