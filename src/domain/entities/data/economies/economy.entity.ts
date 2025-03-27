import { Type } from "domain/enums/data/economy/economy.enums";

type DetailsType = {
  id: string;
  name: string;
};

export interface Economy {
  id: string;
  supplier: DetailsType | null;
  type: Type;
  category: DetailsType;
  subcategory: DetailsType | null;
  value: number;
  quantity: number;
  unit: string;
  description: string;
  date: number;
  reference: string;
  brand: string;
  creationDate: number;
  modificationDate: number;
  isSpecial?: boolean;
}
