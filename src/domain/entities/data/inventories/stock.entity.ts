import { UnitValue } from "shared/constants/unit";

export type StockSubCategory = {
  category: string;
  subcategory: string;
};

export interface Stock {
  id: string;
  inventoryID: string;
  categories: string[];
  subcategories: StockSubCategory[];
  name: string;
  unit: UnitValue;
  visible: boolean;
  reorder: number;
  upperLimit: number;
  reference: string;
  brand: string;
  currentValue: number;
  creationDate: number;
  modificationDate: number;
}
