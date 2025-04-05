import { Type } from "domain/enums/data/inventory/ingredient.enums";

export type RecipeSubCategory = {
  category: string;
  subcategory: string;
};

export type RecipeIngredients = {
  id: string;
  quantity: number;
  type: Type;
};

export interface Recipe {
  id: string;
  inventoryID: string;
  value: number;
  ingredients: RecipeIngredients[];
  categories: string[];
  subcategories: RecipeSubCategory[];
  name: string;
  description: string;
  visible: boolean;
  creationDate: number;
  modificationDate: number;
}
