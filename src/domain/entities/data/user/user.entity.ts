import { Permissions } from "../collaborators";

export interface User {
  identifier: string;
  selected: string;
  permissions: null | Permissions;
  // working: boolean;
  // connection: Logs;
  // disconnection: Logs;
}
