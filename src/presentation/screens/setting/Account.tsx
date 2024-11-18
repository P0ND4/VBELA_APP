import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppDispatch } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { cleanAll } from "application/store/actions";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";

const Account = () => {
  const { colors } = useTheme();

  const dispatch = useAppDispatch();

  const logOut = async () => {
    await signOutWithGoogle();
    dispatch(cleanAll());
  };

  return (
    <Layout style={{ justifyContent: "space-between" }}>
      <View style={styles.information}>
        <TouchableOpacity
          style={[styles.picture, { backgroundColor: colors.card }]}
          onPress={() => alert("Para la cuarta actualización")}
        >
          <Ionicons name="image-outline" size={35} color={colors.text} />
        </TouchableOpacity>
        <View style={{ marginVertical: 15 }}>
          <StyledText>melvincolmenares.m@gmail.com</StyledText>
          <StyledText center color={colors.primary}>
            Sincronizado
          </StyledText>
        </View>
        <StyledButton
          style={styles.planButton}
          backgroundColor={colors.primary}
          onPress={() => alert("Para la cuarta actualización")}
        >
          <StyledText verySmall color="#FFFFFF">
            PLAN GRATUITO
          </StyledText>
        </StyledButton>
      </View>
      <View>
        <StyledText right>4.0.0</StyledText>
        <StyledButton style={styles.row} onPress={() => alert("Para la cuarta actualización")}>
          <StyledText>Borrar datos personales</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
        <StyledButton backgroundColor={colors.primary} onPress={logOut}>
          <StyledText color="#FFFFFF" center>
            Cerrar sesión
          </StyledText>
        </StyledButton>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  information: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  picture: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  planButton: {
    width: "auto",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
});

export default Account;
