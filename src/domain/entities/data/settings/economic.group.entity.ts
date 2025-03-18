import { Type } from "domain/enums/data/economy/economy.enums";

export interface EconomicGroup {
  id: string;
  name: string;
  visible: Type | string;
  creationDate: number;
  modificationDate: number;
}
