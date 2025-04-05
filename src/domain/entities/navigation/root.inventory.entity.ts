import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Inventory, Movement, Portion, Recipe, Stock } from "../data/inventories";
import { Type as TypeMovement } from "domain/enums/data/inventory/movement.enums";
import { Type as TypePortion } from "domain/enums/data/inventory/portion.enums";
import { Group } from "../data";

export type RootInventory = {
  CreateInventory: { inventory?: Inventory };
  StockTab: { inventory: Inventory };
  CreateStockGroup: { inventoryID: string; group?: Group };
  CreateStock: { stock?: Stock; inventoryID: string };
  CreatePortion: { portion?: Portion; inventoryID: string };
  CreatePortionGroup: { inventoryID: string; group?: Group };
  CreateRecipeGroup: { inventoryID: string; group?: Group };
  CreateRecipe: { recipe?: Recipe; inventory: Inventory };
  CreateActivity: { inventoryID: string; type: TypePortion };
  CreateMovement: { movement?: Movement; inventoryID: string; type: TypeMovement };
  MovementInformation: { stockID: string };
  StockInformation: { stock: Stock };
  RecipeInformation: { recipe: Recipe };
  PortionInformation: { portion: Portion };
};

export type InventoryNavigationProp = { navigation: StackNavigationProp<RootInventory> };
export type InventoryRouteProp<RouteName extends keyof RootInventory> = RouteProp<
  RootInventory,
  RouteName
>;
