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
import { Status } from "application/appState/state/state.controller.slice";
import { useSyncCheck } from "presentation/hooks/useSyncCheck";
import StyledText from "../text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "../button/StyledButton";

type NavigationProps = StackNavigationProp<RootApp>;

const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  const { colors } = useTheme();
  const { isSynchronized } = useSyncCheck();

  const user = useAppSelector((state) => state.user);
  const stateController = useAppSelector((state) => state.stateController);

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
            <StyledText bigParagraph>{user?.identifier.slice(0, 18)}</StyledText>
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
      <TouchableOpacity
        style={[styles.bottom, styles.row, { backgroundColor: colors.primary }]}
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
    borderTopWidth: 1,
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
});

export default CustomDrawer;
