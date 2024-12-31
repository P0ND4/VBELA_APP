import { Status } from "domain/enums/data/kitchen/status.enums";
import { Selection } from "../common/order.entity";

export interface Kitchen {
  id: string;
  restaurantID: string;
  location: string;
  order: string;
  status: Status;
  selection: Selection[];
  observation: string;
  creationDate: number;
  modificationDate: number;
}