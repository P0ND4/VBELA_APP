import { random } from "shared/utils";

type SendProps = {
  name?: string;
  value?: number;
  locationID: string;
};

export const send = ({ name = "Sin nombre", value = 0, locationID }: SendProps) => ({
  id: random(10),
  name,
  price: value,
  locationID,
  cost: 0,
  promotion: 0,
  categories: [],
  subcategories: [],
  description: "",
  code: "",
  unit: "",
  highlight: false,
  activeStock: false,
  stock: 0,
  minStock: 0,
  stockIDS: [],
  packageIDS: [],
  creationDate: new Date().getTime(),
  modificationDate: new Date().getTime(),
});
