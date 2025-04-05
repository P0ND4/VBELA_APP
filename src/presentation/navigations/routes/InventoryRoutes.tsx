import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootInventory } from "domain/entities/navigation/root.inventory.entity";
import CreateInventory from "presentation/screens/inventory/CreateInventory";
import StockTab from "presentation/screens/inventory/StockTab";
import CreateStock from "presentation/screens/inventory/stock/CreateStock";
import CreateRecipe from "presentation/screens/inventory/recipe/CreateRecipe";
import StockInformation from "presentation/screens/inventory/stock/StockInformation";
import RecipeInformation from "presentation/screens/inventory/recipe/RecipeInformation";
import CreateMovement from "presentation/screens/inventory/stock/movement/CreateMovement";
import MovementInformation from "presentation/screens/inventory/stock/movement/MovementInformation";
import CreateStockGroup from "presentation/screens/inventory/stock/group/CreateGroup";
import CreateRecipeGroup from "presentation/screens/inventory/recipe/group/CreateGroup";
import PortionInformation from "presentation/screens/inventory/portion/PortionInformation";
import CreatePortion from "presentation/screens/inventory/portion/CreatePortion";
import CreatePortionGroup from "presentation/screens/inventory/portion/group/CreateGroup";
import CreateActivity from "presentation/screens/inventory/portion/CreateActivity";

const Stack = createStackNavigator<RootInventory>();

const InventoryRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CreateInventory"
        component={CreateInventory}
        options={{ title: "Crear inventario" }}
      />
      <Stack.Screen name="StockTab" component={StockTab} />
      <Stack.Screen name="CreateStockGroup" component={CreateStockGroup} />
      <Stack.Screen name="CreateStock" component={CreateStock} options={{ title: "Crear stock" }} />
      <Stack.Screen
        name="CreatePortion"
        component={CreatePortion}
        options={{ title: "Crear porción" }}
      />
      <Stack.Screen name="CreatePortionGroup" component={CreatePortionGroup} />
      <Stack.Screen name="CreateRecipe" component={CreateRecipe} />
      <Stack.Screen name="CreateRecipeGroup" component={CreateRecipeGroup} />
      <Stack.Screen name="CreateMovement" component={CreateMovement} />
      <Stack.Screen name="CreateActivity" component={CreateActivity} />
      <Stack.Screen
        name="MovementInformation"
        component={MovementInformation}
        options={{ title: "Movimientos" }}
      />

      <Stack.Screen name="StockInformation" component={StockInformation} />
      <Stack.Screen name="RecipeInformation" component={RecipeInformation} />
      <Stack.Screen name="PortionInformation" component={PortionInformation} />
    </Stack.Navigator>
  );
};

export default InventoryRoutes;
