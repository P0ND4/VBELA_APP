import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { selectPendingOrders, selectPendingSales } from "application/selectors";
import { useTheme } from "@react-navigation/native";
import { AppNavigationProp } from "domain/entities/navigation";
import { thousandsSystem } from "shared/utils";
import { useAppSelector } from "application/store/hook";
import { Status } from "domain/enums/data/element/status.enums";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import ProductOrder from "./product/ProductOrder";
import MenuOrder from "./menu/MenuOrder";

const Tab = createMaterialTopTabNavigator();

const Order: React.FC<AppNavigationProp> = ({ navigation }) => {
  const sales = useAppSelector(selectPendingSales);
  const orders = useAppSelector(selectPendingOrders);

  const { colors } = useTheme();

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 20 }}>
  //         <TouchableOpacity onPress={() => alert("Para la segunda actualización")}>
  //           <Ionicons name="reader-outline" color={colors.primary} size={30} />
  //         </TouchableOpacity>
  //         <TouchableOpacity
  //           style={{ marginHorizontal: 4 }}
  //           onPress={() => alert("Para la segunda actualización")}
  //         >
  //           <Ionicons name="list-outline" color={colors.primary} size={30} />
  //         </TouchableOpacity>
  //       </View>
  //     ),
  //   });
  // }, []);

  const BadgeIcon: React.FC<{ count: number }> = ({ count }) => (
    <View style={[styles.order, { backgroundColor: colors.primary }]}>
      <StyledText verySmall color="#FFFFFF">
        {thousandsSystem(count)}
      </StyledText>
    </View>
  );

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="PEDIDOS"
        options={{ tabBarBadge: () => sales.length > 0 && <BadgeIcon count={sales.length} /> }}
      >
        {() => (
          <ProductOrder
            sales={sales}
            statusFilter={[Status.Pending, Status.Standby, Status.Confirmed]}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MENÚ"
        options={{ tabBarBadge: () => orders.length > 0 && <BadgeIcon count={orders.length} /> }}
      >
        {() => (
          <MenuOrder
            orders={orders}
            statusFilter={[Status.Pending, Status.Standby, Status.Confirmed]}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  order: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    right: 30,
    top: 13,
  },
});

export default Order;
