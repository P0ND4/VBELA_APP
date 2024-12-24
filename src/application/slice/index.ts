import * as collaborators from "./collaborators";
import * as customers from "./customers";
import * as inventories from "./inventories";
import * as productsAndServices from "./stores";
import * as reservations from "./reservations";
import * as restaurants from "./restaurants";
import * as suppliers from "./suppliers";
import * as user from "./user";
import * as settings from "./settings";
import * as kitchens from "./kitchens";

export default {
  ...collaborators,
  ...customers,
  ...inventories,
  ...productsAndServices,
  ...reservations,
  ...restaurants,
  ...suppliers,
  ...user,
  ...settings,
  ...kitchens
};
