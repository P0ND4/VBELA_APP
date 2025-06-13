import React, { useMemo } from "react";
import { View, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { Status } from "application/appState/internet/status.slice";
import { useAppSelector } from "application/store/hook";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";

const WifiConnection = () => {
  const { colors } = useTheme();
  const { ping } = useWebSocketContext();

  const { identifier, selected } = useAppSelector((state) => state.user);
  const session = useAppSelector((state) => state.session);
  const internetStatus = useAppSelector((state) => state.internetStatus);
  const collaborators = useAppSelector((state) => state.collaborators);

  const validation = useMemo(
    () =>
      (identifier !== selected || (identifier === selected && collaborators.length > 0)) && session,
    [collaborators, identifier, selected, session],
  );

  return (
    (!ping || internetStatus.status === Status.Offline) &&
    validation && (
      <Modal visible={true} transparent animationType="fade">
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background }]}>
          <View style={styles.container}>
            <ActivityIndicator size={60} color={colors.primary} />
            <StyledText style={{ marginTop: 15 }}>Conectando al servidor</StyledText>
          </View>
        </View>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WifiConnection;
