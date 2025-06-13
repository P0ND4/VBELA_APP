import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import apiClient from "infrastructure/api/server";
import { useSyncCheck } from "presentation/hooks/useSyncCheck";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { readQueueOperation } from "infrastructure/offline/operation.queue";
import endpoints from "config/constants/api.endpoints";
import { useLogout } from "infrastructure/auth/useLogout";
import { useWebSocketContext } from "infrastructure/context/SocketContext";

const Account = () => {
  const { colors } = useTheme();
  const { isSynchronized } = useSyncCheck();
  const { identifier, selected } = useAppSelector((state) => state.user);
  const { logout } = useLogout();
  const { disconnect } = useWebSocketContext();

  return (
    <Layout style={{ justifyContent: "space-between" }}>
      <View style={styles.information}>
        {identifier !== selected && (
          <StyledText center color={colors.primary} style={{ marginBottom: 15 }}>
            Colaborador
          </StyledText>
        )}
        <TouchableOpacity
          style={[styles.picture, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          <Ionicons name="image-outline" size={35} color={colors.text} />
        </TouchableOpacity>
        <View style={{ marginVertical: 15 }}>
          <StyledText>{identifier}</StyledText>
          <StyledText center color={colors.primary}>
            {isSynchronized ? "Sincronizado" : "No Sincronizado"}
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
        {identifier === selected && (
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
                          { synchronization: false, token: true },
                        );
                      };
                      logout(callback);
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
        )}
        <StyledButton
          backgroundColor={colors.primary}
          onPress={async () => {
            const currentQueue = await readQueueOperation();

            const callback = async () => await disconnect();

            if (currentQueue.length > 0) {
              Alert.alert(
                "EY!",
                "Tienes datos sin sincronizar ¿Estás seguro de que deseas cerrar sesión? los datos no sincronizados se perderan",
                [
                  {
                    text: "Si",
                    onPress: () => logout(callback),
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
            } else logout(callback);
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
