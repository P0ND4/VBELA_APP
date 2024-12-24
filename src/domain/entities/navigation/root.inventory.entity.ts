import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Inventory, Movement, Recipe, Stock } from "../data/inventories";
import { Type } from "domain/enums/data/inventory/movement.enums";

export type RootInventory = {
  CreateInventory: { inventory?: Inventory };
  StockTab: { inventory: Inventory };
  CreateStock: { stock?: Stock; inventoryID: string };
  CreateRecipe: { recipe?: Recipe; inventory: Inventory };
  CreateMovement: { movement?: Movement; inventoryID: string; type: Type };
  MovementInformation: { stockID: string };
  StockInformation: { stock: Stock };
  RecipeInformation: { recipe: Recipe };
};

export type InventoryNavigationProp = { navigation: StackNavigationProp<RootInventory> };
export type InventoryRouteProp<RouteName extends keyof RootInventory> = RouteProp<
  RootInventory,
  RouteName
>;
