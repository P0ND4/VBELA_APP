import { Type } from "domain/enums/data/inventory/movement.enums";
import { UnitValue } from "shared/constants/unit";

export type Movement = {
  id: string;
  inventoryID: string;
  stockID: string;
  supplierID?: string;
  type: Type;
  quantity: number;
  currentValue: number;
  date: string;
  paymentMethod?: string;
  creationDate: string;
  modificationDate: string;
};

export interface Stock {
  id: string;
  inventoryID: string;
  name: string;
  unit: UnitValue;
  visible: boolean;
  reorder: number;
  reference: string;
  brand: string;
  currentValue: number;
  movement: Movement[];
  creationDate: string;
  modificationDate: string;
}
