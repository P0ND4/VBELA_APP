import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Order, Save, Selection } from "domain/entities/data/common/order.entity";
import { add as addOrder, edit as editOrder } from "application/slice/restaurants/orders.slice";
import { add as addKitchen } from "application/slice/kitchens/kitchens.slice";
import {
  Discount,
  useExtractMovement,
  useExtractStock,
  useOrganizeData,
} from "presentation/screens/common/sales/hooks";
import { Status } from "domain/enums/data/element/status.enums";
import { batch } from "react-redux";
import { discount } from "application/slice/restaurants/menu.slice";
import { Kitchen } from "domain/entities/data/kitchens";
import { Movement, Portion } from "domain/entities/data/inventories";
import apiClient, { endpoints } from "infrastructure/api/server";
import { add as addMovement } from "application/slice/inventories/movements.slice";
import { edit as editPortion } from "application/slice/inventories/portions.slice";
import { useExtractPortion } from "presentation/screens/common/sales/hooks/useExtractPortion";

export type CallbackProps = { order: Order; kitchen: Kitchen | null };

const useSave = () => {
  const menu = useAppSelector((state) => state.menu);

  const { organizeOrder, organizeKitchen } = useOrganizeData();
  const extractStock = useExtractStock();
  const extractMovement = useExtractMovement();
  const extractPortion = useExtractPortion();

  const dispatch = useAppDispatch();

  const condition = (status: Status) => status === Status.Completed;

  const getInformation = (selection: Selection[]) => {
    const movements = extractMovement(selection);
    const discounts = extractStock(selection, menu);
    const portions = extractPortion(selection);
    return { movements, discounts, portions };
  };

  const handler = (movements: Movement[], discounts: Discount[], portions: Portion[]) => {
    !!movements.length && movements.forEach((movement) => dispatch(addMovement(movement)));
    !!discounts.length && dispatch(discount(discounts));
    !!portions.length && portions.forEach((portion) => dispatch(editPortion(portion)));
  };

  const save = async (props: Save, callback?: (props: CallbackProps) => void) => {
    const order = organizeOrder(props);

    let movements: Movement[] = [];
    let discounts: Discount[] = [];
    let portions: Portion[] = [];

    if (condition(props.status)) {
      const information = getInformation(props.selection);
      movements = information.movements;
      discounts = information.discounts;
      portions = information.portions;
    }

    batch(() => {
      dispatch(addOrder(order));
      if (condition(props.status)) handler(movements, discounts, portions);
    });

    callback && callback({ order, kitchen: null });

    await apiClient({
      url: endpoints.order.post(),
      method: "POST",
      data: {
        movements,
        discounts,
        order,
        portions,
      },
    });
  };

  const update = async (order: Order, callback?: (props: CallbackProps) => void) => {
    let movements: Movement[] = [];
    let discounts: Discount[] = [];
    let portions: Portion[] = [];

    if (condition(order.status)) {
      const information = getInformation(order.selection);
      movements = information.movements;
      discounts = information.discounts;
      portions = information.portions;
    }

    batch(() => {
      dispatch(editOrder(order));
      if (condition(order.status)) handler(movements, discounts, portions);
    });

    callback && callback({ order, kitchen: null });

    await apiClient({
      url: endpoints.order.put(order.id),
      method: "PUT",
      data: {
        movements,
        discounts,
        order,
        portions,
      },
    });
  };

  const kitchen = async (
    props: Save,
    order: Order | null,
    callback?: (props: CallbackProps) => void,
  ) => {
    const data = order || organizeOrder(props);
    const kitchen = organizeKitchen(data);

    batch(() => {
      if (order) dispatch(editOrder(data));
      else dispatch(addOrder(data));
      dispatch(addKitchen(kitchen));
    });
    callback && callback({ order: data, kitchen });

    await apiClient({
      url: endpoints.kitchen.post(),
      method: "POST",
      data: {
        kitchen,
        order: data,
      },
    });
  };

  return { save, update, kitchen };
};

export default useSave;
