import { Type } from "domain/enums/data/economy/economy.enums";
import { GroupSubCategory } from "../common";

export interface EconomicGroup {
  id: string;
  category: string;
  subcategories: GroupSubCategory[];
  visible: Type | string;
  creationDate: number;
  modificationDate: number;
}
