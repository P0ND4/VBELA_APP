import React, { useMemo } from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAppSelector } from "application/store/hook";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { Status } from "application/appState/state/state.controller.slice";
import { useSyncCheck } from "presentation/hooks/useSyncCheck";
import StyledText from "../text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "../button/StyledButton";

type NavigationProps = StackNavigationProp<RootApp>;

const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  const { colors } = useTheme();
  const { isSynchronized } = useSyncCheck();
  const { ping } = useWebSocketContext();

  const { identifier, selected } = useAppSelector((state) => state.user);
  const stateController = useAppSelector((state) => state.stateController);
  const collaborators = useAppSelector((state) => state.collaborators);

  const validation = useMemo(
    () => identifier !== selected || (identifier === selected && collaborators.length > 0),
    [collaborators, identifier, selected],
  );

  const navigation = useNavigation<NavigationProps>();

  // const shareApp = async () => {
  //   try {
  //     const message = `Descarga VBELA, la app para gestionar alquileres, restaurantes y ventas. Descárgala en la Play Store https://play.google.com/store/apps/details?id=com.app.vbela. ¡Controla tu negocio ahora!`;
  //     await Share.share({ message });
  //   } catch (e: any) {
  //     console.log(e.message);
  //   }
  // };

  const condition = useMemo(() => stateController.status === Status.Active, [stateController]);

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ padding: 15 }}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("SettingRoutes", { screen: "Account" })}
          >
            <StyledText bigParagraph>{identifier.slice(0, 18)}</StyledText>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          <StyledText verySmall>{isSynchronized ? "Sincronizado" : "No Sincronizado"}</StyledText>
          <View style={{ flexDirection: "row" }}>
            <StyledButton
              style={styles.planButton}
              backgroundColor={colors.primary}
              onPress={() => {}}
            >
              <StyledText verySmall color="#FFFFFF">
                PLAN GRATUITO
              </StyledText>
            </StyledButton>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={[
                styles.state,
                {
                  backgroundColor: condition ? colors.primary : colors.border,
                },
              ]}
            />
            <StyledText verySmall>
              Caja:{" "}
              <StyledText verySmall color={colors.primary}>
                {stateController.status}
              </StyledText>
            </StyledText>
          </View>
        </View>
        <DrawerItemList {...props} />
        {/* <DrawerItem {...props} label="Configuración" onPress={() => alert("Link a la ayuda")} /> */}
      </DrawerContentScrollView>
      {validation && (
        <View style={[styles.pingContainer, { backgroundColor: colors.background }]}>
          <StyledText
            verySmall
            color={(ping ?? 0) < 200 ? colors.primary : (ping ?? 0) < 500 ? "orange" : "red"}
          >
            {ping ? `${ping} ms` : "Sin conexión"}
          </StyledText>
          <Ionicons
            name="wifi"
            size={15}
            color={(ping ?? 0) < 200 ? colors.primary : (ping ?? 0) < 500 ? "orange" : "red"}
            style={{ marginLeft: 5 }}
          />
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.bottom,
          styles.row,
          { backgroundColor: colors.primary, borderTopWidth: validation ? 0 : 1 },
        ]}
        onPress={() => {}}
      >
        <View>
          <StyledText color="#FFFFFF">Cambia tu plan</StyledText>
          <StyledText color="#FFFFFF" verySmall>
            Mejora tu experiencia con nosotros
          </StyledText>
        </View>
        <Ionicons name="chevron-forward" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonDown: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  bottom: {
    paddingHorizontal: 15,
    paddingVertical: 25,
    borderTopColor: "#CCC",
  },
  planButton: {
    width: "auto",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  state: {
    marginRight: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pingContainer: {
    borderTopWidth: 1,
    borderTopColor: "#CCC",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CustomDrawer;
