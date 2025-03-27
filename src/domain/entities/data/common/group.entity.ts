export type GroupSubCategory = { id: string; name: string };

export interface Group {
  id: string;
  ownerID: string;
  category: string;
  subcategories: GroupSubCategory[];
  creationDate: number;
  modificationDate: number;
}
