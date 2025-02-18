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
  date: number;
  paymentMethod?: string;
  creationDate: number;
  modificationDate: number;
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
  movements: Movement[];
  creationDate: number;
  modificationDate: number;
}
