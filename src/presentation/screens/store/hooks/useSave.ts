import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Order, Save, Selection } from "domain/entities/data/common/order.entity";
import { add, edit } from "application/slice/stores/sales.slice";
import { batch } from "react-redux";
import { discount } from "application/slice/stores/products.slice";
import {
  Discount,
  useExtractMovement,
  useExtractStock,
  useOrganizeData,
} from "presentation/screens/common/sales/hooks";
import { Status } from "domain/enums/data/element/status.enums";
import { addMovement } from "application/slice/inventories/stocks.slice";
import { Movement } from "domain/entities/data/inventories";
import apiClient, { endpoints } from "infrastructure/api/server";

export type CallbackProps = { order: Order };

const useSave = () => {
  const products = useAppSelector((state) => state.products);

  const { organizeOrder } = useOrganizeData();
  const extractMovement = useExtractMovement();
  const extractStock = useExtractStock();

  const dispatch = useAppDispatch();

  const condition = (status: Status) => status === Status.Completed;

  const getInformation = (selection: Selection[]) => {
    const movements = extractMovement(selection);
    const discounts = extractStock(selection, products);
    return { movements, discounts };
  };

  const handler = (movements: Movement[], discounts: Discount[]) => {
    !!movements.length && dispatch(addMovement(movements));
    !!discounts.length && dispatch(discount(discounts));
  };

  const save = async (props: Save, callback?: (props: CallbackProps) => void): Promise<void> => {
    const order = organizeOrder(props);
    let movements: Movement[] = [];
    let discounts: Discount[] = [];

    if (condition(props.status)) {
      const information = getInformation(props.selection);
      movements = information.movements;
      discounts = information.discounts;
    }

    batch(() => {
      dispatch(add(order));
      if (condition(props.status)) handler(movements, discounts);
    });
    callback && callback({ order });

    await apiClient({
      url: endpoints.sale.post(),
      method: "POST",
      data: {
        movements,
        discounts,
        order,
      },
    });
  };

  const update = async (order: Order, callback?: (props: CallbackProps) => void): Promise<void> => {
    let movements: Movement[] = [];
    let discounts: Discount[] = [];

    if (condition(order.status)) {
      const information = getInformation(order.selection);
      movements = information.movements;
      discounts = information.discounts;
    }

    batch(() => {
      dispatch(edit(order));
      if (condition(order.status)) handler(movements, discounts);
    });
    callback && callback({ order });

    await apiClient({
      url: endpoints.sale.put(),
      method: "PUT",
      data: {
        movements,
        discounts,
        order,
      },
    });
  };

  return { save, update };
};

export default useSave;
