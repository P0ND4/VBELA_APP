import Ionicons from "@expo/vector-icons/Ionicons";

export type Selection = {
  id: string;
  name: string;
  unit?: string;
  registered: boolean;
  discount: number;
  total: number;
  quantity: number;
  value: number;
};

type Icons = keyof typeof Ionicons.glyphMap;

export type PaymentMethod = {
  amount: number;
  icon: Icons;
  method: string;
  id: string;
};

export interface Order {
  id: string;
  invoice: string;
  order: string;
  status: string;
  selection: Selection[];
  discount: number;
  paid: number;
  total: number;
  change: number;
  paymentMethods: PaymentMethod[];
  observation: string;
  creationDate: string;
  modificationDate: string;
}
