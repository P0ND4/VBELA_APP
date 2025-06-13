export type Permissions = {
  admin: boolean;
  accessToStatistics: boolean;
  accessToStore: boolean;
  accessToRestaurant: boolean;
  accessToKitchen: boolean;
  accessToEconomy: boolean;
  accessToSupplier: boolean;
  accessToCollaborator: boolean;
  accessToInventory: boolean;
};

export interface Collaborator {
  id: string;
  name: string;
  identifier: string;
  lastName: string;
  permissions: Permissions;
  creationDate: number;
  modificationDate: number;
}
