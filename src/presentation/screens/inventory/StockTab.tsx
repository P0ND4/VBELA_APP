import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { useAppSelector } from "application/store/hook";
import { Inventory } from "domain/entities/data/inventories";
import Stock from "./stock/Stock";
import Recipe from "./recipe/Recipe";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import Portion from "./portion/Portion";
import Shortage from "./shortage/Shortage";
import Movement from "./movement/Movement";

const Tab = createMaterialTopTabNavigator();

type StockTabProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"StockTab">;
};

const StockTab: React.FC<StockTabProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const inventories = useAppSelector((state) => state.inventories);

  const inventory = route.params.inventory;
  const [data, setData] = useState<Inventory>(inventory);
  const [visualization, setVisualization] = useState<"block" | "table">("block");

  useEffect(() => {
    const data = inventories.find((i) => i.id === inventory.id);
    if (!data) return navigation.pop();
    setData(data);
  }, [inventories]);

  useEffect(() => {
    navigation.setOptions({
      title: `Inventario: ${data.name}`,
      headerRight: () => (
        <View style={styles.viewContainer}>
          <TouchableOpacity style={{ marginRight: 4 }} onPress={() => setVisualization("block")}>
            <Ionicons
              name="menu"
              size={20}
              color={visualization === "block" ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setVisualization("table")}>
            <Ionicons
              name="grid-outline"
              size={20}
              color={visualization === "table" ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [data, visualization]);

  return (
    <Tab.Navigator screenOptions={{ tabBarLabelStyle: { fontSize: 12 } }}>
      <Tab.Screen name="STOCK">
        {(props) => <Stock {...props} inventoryID={inventory.id} visualization={visualization} />}
      </Tab.Screen>
      <Tab.Screen name="PORCIONES">
        {(props) => <Portion {...props} inventoryID={inventory.id} visualization={visualization} />}
      </Tab.Screen>
      <Tab.Screen name="AGRUPACIÓN">
        {(props) => <Recipe {...props} inventory={data} visualization={visualization} />}
      </Tab.Screen>
      <Tab.Screen name="PEDIDOS">
        {(props) => (
          <Shortage {...props} inventoryID={inventory.id} visualization={visualization} />
        )}
      </Tab.Screen>
      <Tab.Screen name="MOVIMIENTO">
        {(props) => (
          <Movement {...props} inventoryID={inventory.id} visualization={visualization} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    marginRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default StockTab;
