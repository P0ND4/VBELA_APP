import { useAppSelector } from "application/store/hook";
import { useMemo } from "react";

export const useMovementsMap = () => {
  const movements = useAppSelector((state) => state.movements);

  const quantitiesMap = useMemo(() => {
    const quantityMap = new Map();

    movements.forEach((m) => {
      const currentQuantity = quantityMap.get(m.stock.id) || 0;
      quantityMap.set(m.stock.id, currentQuantity + m.quantity);
    });

    return quantityMap;
  }, [movements]);

  return quantitiesMap;
};
