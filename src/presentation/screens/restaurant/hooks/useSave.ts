import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Order, Save, Selection } from "domain/entities/data/common/order.entity";
import { add as addOrder, edit as editOrder } from "application/slice/restaurants/orders.slice";
import { add as addKitchen } from "application/slice/kitchens/kitchens.slice";
import {
  useExtractMovement,
  useExtractStock,
  useOrganizeData,
} from "presentation/screens/common/sales/hooks";
import { Status } from "domain/enums/data/element/status.enums";
import { batch } from "react-redux";
import { addMovement } from "application/slice/inventories/stocks.slice";
import { discount } from "application/slice/restaurants/menu.slice";
import { Kitchen } from "domain/entities/data/kitchens";

export type CallbackProps = { order: Order; kitchen: Kitchen | null };

const useSave = () => {
  const menu = useAppSelector((state) => state.menu);

  const { organizeOrder, organizeKitchen } = useOrganizeData();
  const extractStock = useExtractStock();
  const extractMovement = useExtractMovement();

  const dispatch = useAppDispatch();

  const handler = (status: Status, selection: Selection[]) => {
    if (status === Status.Completed) {
      const movements = extractMovement(selection);
      const discounts = extractStock(selection, menu);

      !!movements.length && dispatch(addMovement(movements));
      !!discounts.length && dispatch(discount(discounts));
    }
  };

  const save = (props: Save, callback?: (props: CallbackProps) => void) => {
    const order = organizeOrder(props);

    batch(() => {
      dispatch(addOrder(order));
      handler(props.status, props.selection);
    });

    callback && callback({ order, kitchen: null });
  };

  const update = (data: Order, callback?: (props: CallbackProps) => void) => {
    batch(() => {
      dispatch(editOrder(data));
      handler(data.status, data.selection);
    });

    callback && callback({ order: data, kitchen: null });
  };

  const kitchen = (
    props: Save,
    order: Order | null,
    callback?: (props: CallbackProps) => void,
  ): void => {
    const data = order || organizeOrder(props);
    const kitchen = organizeKitchen(data);

    batch(() => {
      if (order) dispatch(editOrder(data));
      else dispatch(addOrder(data));
      dispatch(addKitchen(kitchen));
    });

    callback && callback({ order: data, kitchen });
  };

  return { save, update, kitchen };
};

export default useSave;
