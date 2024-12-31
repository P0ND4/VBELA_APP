import { useAppSelector } from "application/store/hook";
import { Order, Save } from "domain/entities/data/common";
import { Kitchen } from "domain/entities/data/kitchens";
import { Status } from "domain/enums/data/kitchen/status.enums";
import { random } from "shared/utils";

export const useOrganizeData = () => {
  const restaurants = useAppSelector((state) => state.restaurants);
  const tables = useAppSelector((state) => state.tables);

  const organizeOrder = (props: Save): Order => {
    const { discount, observation } = props.info;
    const value = props.selection.reduce((a, b) => a + b.total, 0);
    const paid = props.paymentMethods.reduce((a, b) => a + b.amount, 0);
    const total = value - value * discount;

    return {
      id: random(10),
      locationID: props.locationID,
      tableID: props.tableID ?? undefined,
      invoice: `000${random(5, { number: true })}`,
      order: random(4, { number: true }),
      paid,
      selection: props.selection,
      status: props.status,
      total,
      change: Math.max(paid - total, 0),
      observation,
      paymentMethods: props.paymentMethods,
      discount,
      creationDate: new Date().getTime(),
      modificationDate: new Date().getTime(),
    };
  };

  const organizeKitchen = (order: Order): Kitchen => {
    const restaurant = restaurants.find((r) => r.id === order.locationID);
    const table = tables.find((t) => t.id === order.tableID);

    return {
      id: random(10),
      restaurantID: order.locationID,
      location: `${restaurant?.name} ${table?.name}`,
      order: order.order,
      status: Status.Requested,
      selection: order.selection,
      observation: order.observation,
      creationDate: order.creationDate,
      modificationDate: order.modificationDate,
    };
  };

  return { organizeOrder, organizeKitchen };
};
