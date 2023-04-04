import { clean as cleanUser } from "../features/user/informationSlice";
import { clean as cleanReservations } from "../features/groups/reservationsSlice";
import { clean as cleanNomenclatures } from "../features/groups/nomenclaturesSlice";
import { clean as cleanGroups } from "../features/groups/informationSlice";
import { clean as cleanHelpers } from "../features/helpers/informationSlice";
import { clean as cleanTables } from "../features/tables/informationSlice";
import { clean as cleanOrders } from "../features/tables/ordersSlice";
import { clean as cleanEconomy } from "../features/function/economySlice";
import { inactive as inactiveSession } from "../features/user/sessionSlice";
import { inactive as inactiveGroup } from "../features/function/informationSlice";

export default cleanData = (dispatch) => {
  dispatch(inactiveGroup());
  dispatch(inactiveSession());
  dispatch(cleanUser());
  dispatch(cleanReservations());
  dispatch(cleanNomenclatures());
  dispatch(cleanGroups());
  dispatch(cleanHelpers());
  dispatch(cleanTables());
  dispatch(cleanOrders());
  dispatch(cleanEconomy());
};
