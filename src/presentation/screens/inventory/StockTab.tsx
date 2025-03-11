import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { useAppSelector } from "application/store/hook";
import { Inventory } from "domain/entities/data/inventories";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import Stock from "./stock/Stock";
import Recipe from "./recipe/Recipe";

const Tab = createMaterialTopTabNavigator();

const GET_TAB_NAME: { [key in Visible]: string } = {
  [Visible.Both]: "RECETAS/PAQUETES",
  [Visible.Restaurant]: "RECETAS",
  [Visible.Store]: "PAQUETES",
  [Visible.None]: "SIN VISIBILIDAD",
};

type StockTabProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"StockTab">;
};

const StockTab: React.FC<StockTabProps> = ({ navigation, route }) => {
  const inventories = useAppSelector((state) => state.inventories);

  const inventory = route.params.inventory;
  const [data, setData] = useState<Inventory>(inventory);

  useEffect(() => {
    const data = inventories.find((i) => i.id === inventory.id);
    if (!data) return navigation.pop();
    setData(data);

    navigation.setOptions({ title: `Inventario: ${data.name}` });
  }, [inventories]);

  return (
    <Tab.Navigator>
      <Tab.Screen name="STOCK">
        {(props) => <Stock {...props} inventoryID={inventory.id} />}
      </Tab.Screen>
      <Tab.Screen name={GET_TAB_NAME[data.visible]}>
        {(props) => <Recipe {...props} inventory={data} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default StockTab;
