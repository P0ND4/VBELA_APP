import { Element, Selection } from "domain/entities/data/common";

type Discount = { id: string; quantity: number };

export const useExtractStock = () => {
  const extractStock = (selection: Selection[], elements: Element[]): Discount[] => {
    const elementsMap = new Map(elements.map((e) => [e.id, e]));

    const discounts = selection
      .filter(({ id }) => elementsMap.get(id)?.activeStock)
      .map(({ id, quantity }) => ({ id, quantity }));

    return discounts;
  };

  return extractStock;
};
