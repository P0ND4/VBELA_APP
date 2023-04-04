import { change as changeReservations } from "../features/groups/reservationsSlice";
import { change as changeNomenclatures } from "../features/groups/nomenclaturesSlice";
import { change as changeGroups } from "../features/groups/informationSlice";
import { change as changeTables } from "../features/tables/informationSlice";
import { change as changeOrders } from "../features/tables/ordersSlice";
import { change as changeEconomy } from "../features/function/economySlice";

export default changeGeneralInformation = (dispatch, data) => {
  dispatch(changeGroups(data.groups));
  dispatch(changeReservations(data.reservations));
  dispatch(changeNomenclatures(data.nomenclatures));
  dispatch(changeTables(data.tables));
  dispatch(changeOrders(data.orders));
  dispatch(changeEconomy(data.economy));
};
