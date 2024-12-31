import { Visible } from "domain/enums/data/inventory/visible.enums";

export interface Inventory {
  id: string;
  name: string;
  visible: Visible;
  description: string;
  highlight: boolean;
  creationDate: number;
  modificationDate: number;
}
