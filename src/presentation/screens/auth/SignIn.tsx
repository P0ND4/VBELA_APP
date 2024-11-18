import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useAppSelector, useAppDispatch } from "application/store/hook";
import { AuthNavigationProp } from "domain/entities/navigation";
import { GoogleAuthentication } from "infrastructure/auth/google.auth";
import { useTheme } from "@react-navigation/native";
import { active } from "application/slice/user/session.slice";
import StyledText from "presentation/components/text/StyledText";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProgressBar from "presentation/components/layout/ProgressBar";
import { change } from "application/slice/user/user.slice";

const SignIn: React.FC<AuthNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const [isProgressBarVisible, setProgressBarVisible] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  const dispatch = useAppDispatch();

  const onPressGoogle = async () => {
    const res = await GoogleAuthentication();
    if (res?.type === "success") {
      setProgressBarVisible(false);
      setStep(1);
      //AQUI LA PETICIÓN AL SERVIDOR Y RECIBO DATOS
      setStep(2);
      dispatch(change({ identifier: res.data.user.email })); //ESTO HACERLO CON EL CHANGEALL
      dispatch(active());
      setStep(3);
    }
  };

  return (
    <Layout style={styles.container}>
      <StyledText color={colors.primary} bigTitle>
        VBELA
      </StyledText>
      <View style={{ marginTop: 5, width: "80%" }}>
        <StyledText style={{ marginBottom: 8 }}>
          ------------- Inicia sesión con -------------
        </StyledText>
        <StyledButton style={styles.button} onPress={onPressGoogle}>
          <Image
            source={require("presentation/assets/auth/icon/google.png")}
            style={{ width: 28, height: 28 }}
          />
          <StyledText style={{ marginLeft: 15 }}>Google</StyledText>
        </StyledButton>
        <StyledButton
          style={styles.button}
          onPress={() => {
            alert("Para la cuarta actualización");
            //navigation.navigate("EmailSignIn")
          }}
        >
          <Image
            source={require("presentation/assets/auth/icon/gmail.png")}
            style={{ width: 28, height: 28 }}
          />
          <StyledText style={{ marginLeft: 15 }}>Correo electrónico</StyledText>
        </StyledButton>
        <StyledButton
          style={styles.button}
          onPress={() => {
            alert("Para la cuarta actualización");
            //navigation.navigate("PhoneSignIn")
          }}
        >
          <Ionicons name="call" size={28} color={colors.primary} />
          <StyledText style={{ marginLeft: 15 }}>SMS/Llamada/WhatsApp</StyledText>
        </StyledButton>
        <StyledText style={{ marginVertical: 8 }}>
          --------------------- Ó ---------------------
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
        </StyledButton>
      </View>

      <ProgressBar modalVisible={isProgressBarVisible} step={step} steps={3} />
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
