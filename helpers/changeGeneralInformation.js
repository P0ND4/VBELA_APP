import { change as changeStandardReservations } from "@features/zones/standardReservationsSlice";
import { change as changeAccommodationReservations } from "@features/zones/accommodationReservationsSlice";
import { change as changeNomenclatures } from "@features/zones/nomenclaturesSlice";
import { change as changeZones } from "@features/zones/informationSlice";
import { change as changeTables } from "@features/tables/informationSlice";
import { change as changeOrders } from "@features/tables/ordersSlice";
import { change as changeEconomy } from "@features/function/economySlice";
import { change as changeMenu } from "@features/tables/menuSlice";
import { change as changeKitchen } from "@features/tables/kitchenSlice";
import { change as changeRoster } from "@features/function/rosterSlice";

import { change as changePeople } from "@features/function/peopleSlice";

import { change as changeClient } from "@features/people/clientSlice";
import { change as changeSupplier } from "@features/people/supplierSlice";

import { change as changeInventory } from "@features/inventory/informationSlice";
import { change as changeProducts } from "@features/sales/productsSlice";
import { change as changeSlice } from "@features/sales/salesSlice";
import { change as changeAccommodations } from "@features/zones/accommodationsSlice";
import { change as changeGroups } from "@features/sales/groupsSlice";


export default changeGeneralInformation = (dispatch, data) => {
  dispatch(changeZones(data.zones));
  dispatch(changeAccommodationReservations(data.reservations.accommodation));
  dispatch(changeStandardReservations(data.reservations.standard));
  dispatch(changeNomenclatures(data.nomenclatures));
  dispatch(changeTables(data.tables));
  dispatch(changeOrders(data.orders));
  dispatch(changeEconomy(data.economy));
  dispatch(changeMenu(data.menu));
  dispatch(changeKitchen(data.kitchen));
  dispatch(changeRoster(data.roster));
  
  
  dispatch(changePeople(data.people));

  dispatch(changeClient(data.people.clients));
  dispatch(changeSupplier(data.people.suppliers));


  dispatch(changeInventory(data.inventory));
  dispatch(changeProducts(data.products));
  dispatch(changeSlice(data.sales));
  dispatch(changeAccommodations(data.accommodations));
  dispatch(changeGroups(data.groups));
};
