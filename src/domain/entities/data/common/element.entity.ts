export interface Element {
  id: string;
  locationID: string;
  name: string;
  price: number;
  cost?: number;
  promotion?: number;
  category?: string[];
  subcategory?: string[];
  description?: string;
  code?: string;
  unit?: string;
  highlight?: boolean;
  stock?: number;
  minStock?: number;
  affiliatedStockID?: string;
  creationDate: string;
  modificationDate: string;
}
