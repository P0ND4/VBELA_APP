import Ionicons from "@expo/vector-icons/Ionicons";
import { Status } from "domain/enums/data/element/status.enums";

type Icons = keyof typeof Ionicons.glyphMap;

export type Selection = {
  id: string;
  name: string;
  unit: string;
  registered: boolean;
  activeStock: boolean;
  packageIDS: string[];
  stockIDS: string[];
  discount: number;
  total: number;
  quantity: number;
  value: number;
};

export type PaymentMethod = {
  amount: number;
  icon: Icons;
  method: string;
  id: string;
};

export interface Order {
  id: string;
  invoice: string;
  locationID: string;
  tableID: string | null;
  order: string;
  status: Status;
  selection: Selection[];
  discount: number;
  paid: number;
  total: number;
  change: number;
  paymentMethods: PaymentMethod[];
  observation: string;
  creationDate: number;
  modificationDate: number;
}

export type Save = {
  selection: Selection[];
  paymentMethods: PaymentMethod[];
  status: Status;
  locationID: string;
  tableID?: string;
  info: { observation: string; discount: number };
};
