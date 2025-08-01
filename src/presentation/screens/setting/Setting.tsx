import React from "react";
import { AppNavigationProp } from "domain/entities/navigation";
import { View, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Permissions } from "domain/entities/data";
import StyledText from "presentation/components/text/StyledText";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";

import * as WebBrowser from "expo-web-browser";
import { useAppSelector } from "application/store/hook";

type Icons = keyof typeof Ionicons.glyphMap;
type PermissionKeys = keyof Permissions;

type CardProps = {
  icon: Icons;
  left: string;
  paragraph?: string;
  right?: string;
  onPress?: () => void;
};

const Card: React.FC<CardProps> = ({ icon, left, right, onPress, paragraph }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { borderColor: colors.border }]} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={30} color={colors.primary} />
        <View style={{ marginLeft: 15 }}>
          <StyledText>{left}</StyledText>
          {paragraph && <StyledText smallParagraph>{paragraph}</StyledText>}
        </View>
      </View>
      {right && <StyledText>{right}</StyledText>}
    </TouchableOpacity>
  );
};

// DONACIONES/WIFI/CLIENTE-PROVEEDOR/PRIVACIDAD-Y-SEGURIDAD/IDIOMA/CONTACTO/INFORMACIÓN-DE-LA-APLICACIÓN

const Setting: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { permissions } = useAppSelector((state) => state.user);

  const validatePermission = (permission: PermissionKeys): boolean =>
    permissions === null || permissions?.[permission];

  return (
    <Layout style={{ padding: 0 }}>
      <Card
        icon="person-circle-outline"
        left="Cuenta"
        onPress={() => navigation.navigate("SettingRoutes", { screen: "Account" })}
      />
      <Card
        icon="color-palette-outline"
        left="Tema"
        onPress={() => navigation.navigate("SettingRoutes", { screen: "Theme" })}
      />
      {validatePermission("admin") && (
        <Card
          icon="card-outline"
          left="Métodos de pago"
          onPress={() => navigation.navigate("SettingRoutes", { screen: "PaymentMethods" })}
        />
      )}
      {validatePermission("admin") && (
        <Card
          icon="receipt-outline"
          left="Factura"
          onPress={() => navigation.navigate("SettingRoutes", { screen: "Invoice" })}
        />
      )}
      {validatePermission("admin") && (
        <Card
          icon="cash-outline"
          left="Categoría de ingreso/egreso"
          onPress={() => navigation.navigate("SettingRoutes", { screen: "EconomicGroup" })}
        />
      )}
      {validatePermission("admin") && (
        <Card
          icon="logo-usd"
          left="Propina/Impuestos de pedidos"
          onPress={() => navigation.navigate("SettingRoutes", { screen: "TipTax" })}
        />
      )}
      {validatePermission("accessToStatistics") && (
        <Card
          icon="bar-chart-outline"
          left="Estadísticas"
          onPress={() => navigation.navigate("SettingRoutes", { screen: "Statistic" })}
        />
      )}
      <Card
        icon="logo-whatsapp"
        left="whatsapp"
        paragraph="Ingresa a nuestro grupo de whatsapp"
        onPress={async () =>
          await WebBrowser.openBrowserAsync("https://chat.whatsapp.com/G0Hiyr2ZcsG5wzY2Txo5Qm")
        }
      />
      <Card
        icon="share-social-outline"
        left="Compartir Fappture con un amigo"
        onPress={async () => {
          const message = `Descarga FAPPTURE, la app para gestionar alquileres, restaurantes y ventas. Descárgala en la Play Store https://play.google.com/store/apps/details?id=com.app.vbela. ¡Controla tu negocio ahora!`;
          await Share.share({ message });
        }}
      />
      <Card
        icon="document-outline"
        left="Política de privacidad"
        onPress={async () =>
          await WebBrowser.openBrowserAsync(
            "https://sites.google.com/view/politica-de-privacidad-vbela/principal",
          )
        }
      />
      <Card
        icon="book-outline"
        left="Términos y condiciones"
        onPress={async () =>
          await WebBrowser.openBrowserAsync(
            "https://sites.google.com/view/terminos-y-condiciones-vbela/inicio",
          )
        }
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
});

export default Setting;
