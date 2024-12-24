import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Order, Save, Selection } from "domain/entities/data/common/order.entity";
import { add, edit } from "application/slice/stores/sales.slice";
import { batch } from "react-redux";
import { discount } from "application/slice/stores/products.and.services.slice";
import {
  useExtractMovement,
  useExtractStock,
  useOrganizeData,
} from "presentation/screens/common/sales/hooks";
import { Status } from "domain/enums/data/element/status.enums";
import { addMovement } from "application/slice/inventories/stocks.slice";

export type CallbackProps = { order: Order };

const useSave = () => {
  const products = useAppSelector((state) => state.productsAndServices);

  const { organizeOrder } = useOrganizeData();
  const extractMovement = useExtractMovement();
  const extractStock = useExtractStock();

  const dispatch = useAppDispatch();

  const handler = (status: Status, selection: Selection[]) => {
    if (status === Status.Completed) {
      const movements = extractMovement(selection);
      const discounts = extractStock(selection, products);

      !!movements.length && dispatch(addMovement(movements));
      !!discounts.length && dispatch(discount(discounts));
    }
  };

  const save = (props: Save, callback?: (props: CallbackProps) => void): void => {
    const data = organizeOrder(props);

    batch(() => {
      dispatch(add(data));
      handler(props.status, props.selection);
    });

    callback && callback({ order: data });
  };

  const update = (data: Order, callback?: (props: CallbackProps) => void): void => {
    batch(() => {
      dispatch(edit(data));
      handler(data.status, data.selection);
    });
    callback && callback({ order: data });
  };

  return { save, update };
};

export default useSave;
