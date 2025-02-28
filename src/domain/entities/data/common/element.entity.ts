export type ElementSubCategory = {
  category: string;
  subcategory: string;
};

export interface Element {
  id: string;
  locationID: string;
  name: string;
  price: number;
  cost: number;
  promotion: number;
  categories: string[];
  subcategories: ElementSubCategory[];
  description: string;
  code: string;
  unit: string;
  highlight: boolean;
  activeStock: boolean;
  stock: number;
  minStock: number;
  stockIDS: string[];
  packageIDS: string[];
  creationDate: number;
  modificationDate: number;
}
