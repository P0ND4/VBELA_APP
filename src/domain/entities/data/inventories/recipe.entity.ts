export type RecipeSubCategory = {
  category: string;
  subcategory: string;
};

export type Ingredients = {
  id: string;
  quantity: number;
};

export interface Recipe {
  id: string;
  inventoryID: string;
  value: number;
  ingredients: Ingredients[];
  categories: string[];
  subcategories: RecipeSubCategory[];
  name: string;
  description: string;
  visible: boolean;
  creationDate: number;
  modificationDate: number;
}
