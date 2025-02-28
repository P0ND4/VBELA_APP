export interface Collaborator {
  id: string;
  name: string;
  lastName: string;
  email: string;
  admin: boolean;
  accessToStatistics: boolean;
  accessToStore: boolean;
  accessToRestaurant: boolean;
  accessToKitchen: boolean;
  accessToInventory: boolean;
}
