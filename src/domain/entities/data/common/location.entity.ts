export interface Location {
  id: string;
  name: string;
  description?: string;
  inventories: string[];
  highlight: boolean;
  creationDate: string;
  modificationDate: string;
}
