import React from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { AuthNavigationProp } from "domain/entities/navigation";
import { GoogleAuthentication } from "infrastructure/auth/google.auth";
import { useTheme } from "@react-navigation/native";
import { sessions as getSessions } from "infrastructure/auth/sessions";
import StyledText from "presentation/components/text/StyledText";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

const SignIn: React.FC<AuthNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const onPressGoogle = async () => {
    const res = await GoogleAuthentication();
    if (res?.type === "success") {
      try {
        const identifier = res.data.user.email;
        const { sessions, token } = await getSessions(identifier);
        navigation.navigate("Session", { identifier, sessions, token });
      } catch (error) {
        Alert.alert("Error", `Hubo un error: ${error}`);
      }
    }
  };

  return (
    <Layout style={styles.container}>
      <StyledText color={colors.primary} bigTitle>
        Fappture
      </StyledText>
      <View style={{ marginTop: 5, width: "80%" }}>
        <StyledText center style={{ marginBottom: 8 }}>
          Inicia sesión con
        </StyledText>
        <StyledButton style={styles.button} onPress={onPressGoogle}>
          <Image
            source={require("presentation/assets/auth/icon/google.png")}
            style={{ width: 28, height: 28 }}
          />
          <StyledText style={{ marginLeft: 15 }}>Google</StyledText>
        </StyledButton>
        <StyledButton style={styles.button} onPress={() => navigation.navigate("EmailSignIn")}>
          <Image
            source={require("presentation/assets/auth/icon/gmail.png")}
            style={{ width: 28, height: 28 }}
          />
          <StyledText style={{ marginLeft: 15 }}>Correo electrónico</StyledText>
        </StyledButton>
        <StyledButton style={styles.button} onPress={() => navigation.navigate("PhoneSignIn")}>
          <Ionicons name="call" size={28} color={colors.primary} />
          <StyledText style={{ marginLeft: 15 }}>SMS/Llamada/WhatsApp</StyledText>
        </StyledButton>
        {/* <StyledText center style={{ marginVertical: 8 }}>
          Ó
        </StyledText>
        <StyledButton
          style={styles.button}
          onPress={() => {
            alert("Para la cuarta actualización");
            //navigation.navigate("EmailSignIn")
          }}
        >
          <Ionicons name="people-outline" color={colors.text} size={28} />
          <StyledText style={{ marginLeft: 15 }}>Ingresa cómo colaborador</StyledText>
        </StyledButton>  */}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SignIn;
