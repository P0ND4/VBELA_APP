import { selectCompletedOrders, selectCompletedSales } from "application/selectors";
import { selectEgress, selectIncome } from "application/selectors/economies.selectors";
import { selectEntry, selectOutput } from "application/selectors/movements.selector";
import { useAppSelector } from "application/store/hook";
import { Economy as EconomyType, Movement as MovementType, Order } from "domain/entities/data";
import { Type as MovementEnums } from "domain/enums/data/inventory/movement.enums";
import { Type as EconomyEnums } from "domain/enums/data/economy/economy.enums";
import { useEffect, useMemo, useState } from "react";

export type GroupedEconomy = {
  key: string;
  economies: EconomyType[];
  quantity: number;
  unit: string;
  value: number;
};

export const useEconomyData = () => {
  const orders = useAppSelector(selectCompletedOrders);
  const sales = useAppSelector(selectCompletedSales);

  const union = useMemo(() => [...orders, ...sales], [orders, sales]);

  const movements = useAppSelector((state) => state.movements);
  const entry = useAppSelector(selectEntry);
  const output = useAppSelector(selectOutput);

  const economies = useAppSelector((state) => state.economies);
  const income = useAppSelector(selectIncome);
  const egress = useAppSelector(selectEgress);

  const [result, setResult] = useState<{
    all: EconomyType[];
    income: EconomyType[];
    egress: EconomyType[];
  }>({ all: [], income: [], egress: [] });

  const convertMovementToEconomy = (movement: MovementType): EconomyType => ({
    id: movement.id,
    supplier: movement.supplier,
    type: movement.type === MovementEnums.Entry ? EconomyEnums.Egress : EconomyEnums.Income,
    category: { id: movement.stock.id, name: movement.reason },
    subcategory: null,
    value: movement.currentValue * movement.quantity,
    quantity: movement.quantity,
    unit: movement.stock.unit || "",
    description: movement.stock.name,
    date: movement.date,
    reference: movement.stock.name,
    brand: "",
    creationDate: movement.creationDate,
    modificationDate: movement.modificationDate,
    operative: true,
    isSpecial: true,
  });

  // Function to convert a order to EconomyType
  const convertOrderToEconomy = (order: Order): EconomyType => ({
    id: order.id,
    supplier: null,
    type: EconomyEnums.Income,
    category: { id: "order", name: "VENTA" },
    subcategory: null,
    value: order.total,
    quantity: order.selection.reduce((a, b) => a + b.quantity, 0),
    unit: "",
    description: `Orden #${order.order}`,
    date: order.creationDate,
    reference: `Orden #${order.invoice}`,
    brand: "",
    creationDate: order.creationDate,
    modificationDate: order.modificationDate,
    operative: true,
    isSpecial: true,
  });

  const combineData = (
    economies: EconomyType[],
    orders: Order[],
    movements: MovementType[],
  ): EconomyType[] => {
    const convertedOrders = orders.map(convertOrderToEconomy);
    const convertedMovements = movements.map(convertMovementToEconomy);

    const combinedData = economies.concat(convertedOrders, convertedMovements);

    combinedData.sort((a, b) => b.creationDate - a.creationDate);

    return combinedData;
  };

  useEffect(() => {
    const all = combineData(economies, union, movements);
    const incomeData = combineData(income, union, entry);
    const egressData = combineData(egress, [], output);

    setResult({
      all,
      income: incomeData,
      egress: egressData,
    });
  }, [economies, movements, orders, sales]);

  return { all: result.all, income: result.income, egress: result.egress };
};
