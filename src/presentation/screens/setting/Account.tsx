import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppDispatch } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { cleanAll } from "application/store/actions";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";
import apiClient, { endpoints } from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

const Account = () => {
  const { colors } = useTheme();

  const dispatch = useAppDispatch();

  const logOut = async (callback: () => void) => {
    await signOutWithGoogle();
    dispatch(cleanAll());
    callback();
  };

  return (
    <Layout style={{ justifyContent: "space-between" }}>
      <View style={styles.information}>
        <TouchableOpacity
          style={[styles.picture, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          <Ionicons name="image-outline" size={35} color={colors.text} />
        </TouchableOpacity>
        <View style={{ marginVertical: 15 }}>
          <StyledText>melvincolmenares.m@gmail.com</StyledText>
          <StyledText center color={colors.primary}>
            Sincronizado
          </StyledText>
        </View>
        <StyledButton style={styles.planButton} backgroundColor={colors.primary} onPress={() => {}}>
          <StyledText verySmall color="#FFFFFF">
            PLAN GRATUITO
          </StyledText>
        </StyledButton>
      </View>
      <View>
        <StyledText right>4.0.0-beta.1</StyledText>
        <StyledButton
          style={styles.row}
          onPress={() => {
            Alert.alert(
              "EY!",
              "¿Estás seguro de que deseas borrar tu cuenta?",
              [
                {
                  text: "Si",
                  onPress: () => {
                    const callback = async () => {
                      await apiClient(
                        {
                          url: endpoints.user.delete(),
                          method: "DELETE",
                        },
                        { synchronization: false },
                      );
                    };
                    logOut(callback);
                  },
                },
                {
                  text: "No",
                  style: "cancel",
                },
              ],
              {
                cancelable: true,
              },
            );
          }}
        >
          <StyledText>Borrar cuenta</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
        <StyledButton
          backgroundColor={colors.primary}
          onPress={() => {
            const callback = async () => {
              await apiClient(
                {
                  url: endpoints.auth.logout(),
                  method: "POST",
                },
                { synchronization: false },
              );
            };
            logOut(callback);
          }}
        >
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
