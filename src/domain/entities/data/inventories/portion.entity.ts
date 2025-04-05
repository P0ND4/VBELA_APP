export type PortionSubCategory = {
  category: string;
  subcategory: string;
};

export type PortionIngredients = {
  id: string;
  quantity: number;
};

export interface Portion {
  id: string;
  inventoryID: string;
  ingredients: PortionIngredients[];
  categories: string[];
  subcategories: PortionSubCategory[];
  name: string;
  visible: boolean;
  description: string;
  quantity: number;
  creationDate: number;
  modificationDate: number;
}
