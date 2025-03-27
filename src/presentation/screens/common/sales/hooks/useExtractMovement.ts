import { useAppSelector } from "application/store/hook";
import { Selection } from "domain/entities/data/common";
import { Inventory, Movement, Stock } from "domain/entities/data/inventories";
import { Type } from "domain/enums/data/inventory/movement.enums";
import { random } from "shared/utils";

interface Discount {
  id: string;
  quantity: number;
}

const createMovement = (
  stock: Stock,
  inventory: Inventory,
  quantity: number,
  date: number,
): Movement => ({
  id: random(10),
  supplier: null,
  supplierValue: 0,
  type: Type.Output,
  inventory: { id: inventory.id, name: inventory.name },
  stock: { id: stock.id, name: stock.name, unit: stock.unit, currentValue: stock.currentValue },
  quantity: -quantity,
  currentValue: stock.currentValue,
  date,
  creationDate: date,
  modificationDate: date,
});

const addQuantity = (acc: Map<string, number>, { id, quantity }: Discount) => {
  acc.set(id, (acc.get(id) || 0) + quantity);
  return acc;
};

export const useExtractMovement = () => {
  const inventories = useAppSelector((state) => state.inventories);
  const recipes = useAppSelector((state) => state.recipes);
  const stocks = useAppSelector((state) => state.stocks);

  const extractMovement = (selection: Selection[]): Movement[] => {
    const data = selection.filter((s) => s.activeStock);

    const ingredients: Discount[] = data.flatMap(({ packageIDS, stockIDS, quantity }) => {
      const recipesPart = recipes
        .filter(({ id }) => packageIDS?.includes(id))
        .flatMap((f) => f.ingredients)
        .map((i) => ({ ...i, quantity: i.quantity * quantity }));

      const stocksPart = (stockIDS || []).flatMap((id) => ({ id, quantity }));

      return [...recipesPart, ...stocksPart];
    });

    const discount: Discount[] = Array.from(
      ingredients.reduce(addQuantity, new Map()),
      ([id, quantity]) => ({ id, quantity }),
    );

    const date = new Date().getTime();

    const movements = discount
      .filter(({ id }) => stocks.some((s) => s.id === id))
      .map(({ id, quantity }) => {
        const stock = stocks.find((s) => s.id === id)!;
        const inventory = inventories.find((i) => i.id === stock.inventoryID)!;
        return createMovement(stock, inventory, quantity, date);
      });

    return movements;
  };

  return extractMovement;
};
