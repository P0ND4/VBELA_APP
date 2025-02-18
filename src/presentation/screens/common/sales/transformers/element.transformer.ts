import { Element } from "domain/entities/data/common";
import { random } from "shared/utils";
import { UnitValue } from "shared/constants/unit";

export const transformElement = (element: Element): Element => ({
  id: element.id || random(10),
  locationID: element.locationID || "",
  name: element.name || "",
  price: element.price || 0,
  cost: element.cost || 0,
  promotion: element.promotion || 0,
  category: element.category || [],
  subcategory: element.subcategory || [],
  description: element.description || "",
  code: element.code || "",
  unit: (element.unit || "") as UnitValue,
  highlight: element.highlight || false,
  activeStock: element.activeStock || false,
  stock: element.stock || 0,
  minStock: element.minStock || 0,
  stockIDS: element.stockIDS || [],
  packageIDS: element.packageIDS || [],
  creationDate: element.creationDate || new Date().getTime(),
  modificationDate: new Date().getTime(),
});
