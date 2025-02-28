export type GroupSubCategory = { id: string; name: string };

export interface Group {
  id: string;
  locationID: string;
  category: string;
  subcategories: GroupSubCategory[];
  creationDate: number;
  modificationDate: number;
}
