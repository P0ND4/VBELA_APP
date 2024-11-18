import { Order, PaymentMethod, Selection } from "domain/entities/data/common/order.entity";
import { useOrder } from "application/context/sales/OrderContext";
import { random } from "shared/utils";

export const useOrganizeData = () => {
  const { clean, info } = useOrder();

  const organizeData = (
    selection: Selection[],
    paymentMethods: PaymentMethod[],
    status: string,
  ) => {
    const value = selection.reduce((a, b) => a + b.total, 0);
    const paid = paymentMethods.reduce((a, b) => a + b.amount, 0);
    const total = value - value * info.discount;

    const data: Order = {
      id: random(10),
      invoice: `000${random(5, { number: true })}`,
      order: random(4, { number: true }),
      paid,
      selection,
      status,
      total,
      change: paid > total ? paid - total : 0,
      observation: info.observation,
      paymentMethods,
      discount: info.discount,
      creationDate: new Date().toISOString(),
      modificationDate: new Date().toISOString(),
    };

    // clean();

    return data;
  };

  return organizeData;
};
