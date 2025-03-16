import { Type } from "domain/enums/data/economy/economy.enums";

type SupplierType = {
  id: string;
  name: string;
};

export interface Economy {
  id: string;
  supplier: SupplierType | null;
  type: Type;
  name: string;
  value: number;
  quantity: number;
  unit: string;
  description: string;
  date: number;
  reference: string;
  brand: string;
  creationDate: number;
  modificationDate: number;
}
