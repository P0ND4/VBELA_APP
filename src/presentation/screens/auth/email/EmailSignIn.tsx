import React, { useState } from "react";
import { Keyboard, View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { AuthNavigationProp } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import apiClient, { endpoints } from "infrastructure/api/server";
import { EMAIL_EXPRESSION } from "shared/constants/expressions";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";

import * as WebBrowser from "expo-web-browser";
import StyledButton from "presentation/components/button/StyledButton";

const TERMS_OF_SERVICE_URL = "https://sites.google.com/view/terminos-y-condiciones-vbela/inicio";
const PRIVACY_POLICY_URL = "https://sites.google.com/view/politica-de-privacidad-vbela/principal";

const termsOfService = async () => await WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL);
const privacyPolicy = async () => await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);

const EmailSignIn: React.FC<AuthNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Layout>
      <View>
        <StyledText style={{ marginBottom: 8 }} bigSubtitle color={colors.primary}>
          ¡HOLA!
        </StyledText>
        <StyledText smallParagraph>
          Te ayudaremos a iniciar sesión con tu correo electrónico en 2 pasos
        </StyledText>
      </View>
      <StyledInput
        stylesContainer={{ marginVertical: 10 }}
        keyboardType="email-address"
        maxLength={64}
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
      />
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
      <StyledButton
        backgroundColor={colors.primary}
        onPress={async () => {
          Keyboard.dismiss();
          if (EMAIL_EXPRESSION.test(email) && !loading) {
            setLoading(true);

            try {
              await apiClient({
                url: endpoints.verify.email(),
                method: "POST",
                data: { email },
              });

              navigation.navigate("EmailVerification", { email });
            } catch (error) {
              Alert.alert("Error", `Hubo un error al verificar el correo electrónico: ${error}`);
            }

            setLoading(false);
          }
        }}
        style={styles.center}
        disable={!EMAIL_EXPRESSION.test(email) || loading}
      >
        {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
        {!loading && <StyledText color="#FFFFFF">Verificar</StyledText>}
        {!loading && <Ionicons name="mail" color="#FFFFFF" size={20} style={{ marginLeft: 10 }} />}
      </StyledButton>
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

export default EmailSignIn;
