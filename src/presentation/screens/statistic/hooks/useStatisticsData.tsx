import { useMemo, useState } from "react";
import { useAppSelector } from "application/store/hook";
import {
  selectCanceledOrders,
  selectCanceledSales,
  selectCompletedKitchen,
  selectCompletedOrders,
  selectCompletedSales,
} from "application/selectors";
import { Order } from "domain/entities/data/common";
import { Economy } from "domain/entities/data";
import { generatePalette } from "shared/utils";
import { DateType, filterByDate, resetDate } from "presentation/components/layout/FullFilterDate";
import { Type as TypeEconomy } from "domain/enums/data/economy/economy.enums";
import Ionicons from "@expo/vector-icons/Ionicons";

type Icons = keyof typeof Ionicons.glyphMap;

export type PaymentMethodSummary = {
  id: string;
  text: string;
  color?: string;
  value: number;
  icon: Icons | null;
  times: number;
};

const calculateTotal = (orders: Order[], economies: Economy[]) => {
  const ordersTotal = orders.reduce((acc, o) => acc + o.total, 0);
  const economiesTotal = economies
    .filter((e) => e.type === TypeEconomy.Income)
    .reduce((acc, e) => acc + e.value, 0);
  return ordersTotal + economiesTotal;
};

const calculateAverageTicket = (orders: Order[], economies: Economy[]) => {
  const totalQuantity = orders.length + economies.length;
  const totalValue = calculateTotal(orders, economies);
  return totalQuantity ? totalValue / totalQuantity : 0;
};

const calculateRevenue = (orders: Order[], economies: Economy[]) => {
  return orders.reduce((acc, o) => acc + o.total, 0) + calculateTotal([], economies);
};

const calculatePaymentMethods = (
  orders: Order[],
  primaryColor: string,
): {
  bestMethod: PaymentMethodSummary | null;
  paymentMethods: PaymentMethodSummary[];
} => {
  const paymentMethods = orders.flatMap((o) => o.paymentMethods);
  const summary = paymentMethods.reduce<PaymentMethodSummary[]>((acc, b) => {
    const found = acc.find((a) => a.id === b.id);
    if (found) {
      found.value += b.amount;
      found.times += 1;
    } else {
      acc.push({
        id: b.id,
        text: b.method,
        value: b.amount,
        icon: b.icon,
        times: 1,
      });
    }
    return acc;
  }, []);

  const palette = generatePalette(primaryColor, summary.length);
  const withColor = summary.map((item, i) => ({ ...item, color: palette[i] }));
  const sorted = withColor.sort((a, b) => b.times - a.times);
  return {
    bestMethod: sorted[0] || null,
    paymentMethods: sorted,
  };
};

const calculateQuantitySold = (orders: Order[]) => {
  return orders.flatMap((o) => o.selection).reduce((a, b) => a + b.quantity, 0);
};

const useStatisticsData = () => {
  const [date, setDate] = useState<DateType>(resetDate);

  const ordersCanceled = useAppSelector(selectCanceledOrders);
  const salesCanceled = useAppSelector(selectCanceledSales);
  const ordersCompleted = useAppSelector(selectCompletedOrders);
  const salesCompleted = useAppSelector(selectCompletedSales);
  const kitchen = useAppSelector(selectCompletedKitchen);
  const economies = useAppSelector((state) => state.economies);

  const OFCompleted = useMemo(() => filterByDate(ordersCompleted, date), [ordersCompleted, date]);
  const SFCompleted = useMemo(() => filterByDate(salesCompleted, date), [salesCompleted, date]);
  const OFCanceled = useMemo(() => filterByDate(ordersCanceled, date), [ordersCanceled, date]);
  const SFCanceled = useMemo(() => filterByDate(salesCanceled, date), [salesCanceled, date]);
  const economiesFiltered = useMemo(() => filterByDate(economies, date), [economies, date]);
  const kitchenFiltered = useMemo(() => filterByDate(kitchen, date), [kitchen, date]);

  const allCompletedOrders = useMemo(
    () => [...OFCompleted, ...SFCompleted],
    [OFCompleted, SFCompleted],
  );

  const totalBill = useMemo(
    () => calculateTotal(allCompletedOrders, economiesFiltered),
    [allCompletedOrders, economiesFiltered],
  );

  const avgTicket = useMemo(
    () => calculateAverageTicket(allCompletedOrders, economiesFiltered),
    [allCompletedOrders, economiesFiltered],
  );

  const totalRevenue = useMemo(
    () => calculateRevenue(allCompletedOrders, economiesFiltered),
    [allCompletedOrders, economiesFiltered],
  );

  const quantitySold = useMemo(
    () => calculateQuantitySold(allCompletedOrders),
    [allCompletedOrders],
  );

  const totalCostOfSale = useMemo(
    () => economiesFiltered.reduce((a, b) => a + b.quantity * b.value, 0),
    [economiesFiltered],
  );

  return {
    date,
    setDate,
    OFCompleted,
    SFCompleted,
    OFCanceled,
    SFCanceled,
    kitchenFiltered,
    economiesFiltered,
    allCompletedOrders,
    totalBill,
    avgTicket,
    totalRevenue,
    quantitySold,
    totalCostOfSale,
    calculatePaymentMethods,
  };
};

export default useStatisticsData;
