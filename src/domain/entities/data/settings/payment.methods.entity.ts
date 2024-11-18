import Ionicons from "@expo/vector-icons/Ionicons";

type Icons = keyof typeof Ionicons.glyphMap;

export interface PaymentMethods {
  id: string;
  name: string;
  icon: Icons;
  creationDate: string;
  modificationDate: string;
}
