import { change as changeReservations } from "@features/groups/reservationsSlice";
import { change as changeNomenclatures } from "@features/groups/nomenclaturesSlice";
import { change as changeGroups } from "@features/groups/informationSlice";
import { change as changeTables } from "@features/tables/informationSlice";
import { change as changeOrders } from "@features/tables/ordersSlice";
import { change as changeEconomy } from "@features/function/economySlice";
import { change as changeMenu } from "@features/tables/menuSlice";
import { change as changeKitchen } from "@features/tables/kitchenSlice";
import { change as changeRoster } from '@features/function/rosterSlice';
import { change as changePeople } from '@features/function/peopleSlice';

export default changeGeneralInformation = (dispatch, data) => {
  dispatch(changeGroups(data.groups));
  dispatch(changeReservations(data.reservations));
  dispatch(changeNomenclatures(data.nomenclatures));
  dispatch(changeTables(data.tables));
  dispatch(changeOrders(data.orders));
  dispatch(changeEconomy(data.economy));
  dispatch(changeMenu(data.menu));
  dispatch(changeKitchen(data.kitchen));
  dispatch(changeRoster(data.roster));
  dispatch(changePeople(data.people));
};
