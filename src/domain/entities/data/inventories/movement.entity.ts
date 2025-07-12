import { Type } from "domain/enums/data/inventory/movement.enums";

type DetailsType = {
  id: string;
  name: string;
};

export type Movement = {
  id: string;
  inventory: DetailsType;
  reason: string;
  stock: DetailsType & { unit?: string; currentValue: number };
  supplier: DetailsType | null;
  supplierValue: number;
  type: Type;
  quantity: number;
  currentValue: number;
  date: number;
  paymentMethod?: string;
  creationDate: number;
  modificationDate: number;
};
