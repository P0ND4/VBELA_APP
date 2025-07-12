import { useAppSelector } from "application/store/hook";
import { RecipeIngredients } from "domain/entities/data";
import { useMemo } from "react";

// Helper function to calculate the cost of a recipe
export const useRecipeCost = (ingredients: RecipeIngredients[]) => {
  const stocks = useAppSelector((state) => state.stocks);
  const portions = useAppSelector((state) => state.portions);

  return useMemo(() => {
    const stocksMap = new Map(stocks.map((s) => [s.id, s]));
    const portionsMap = new Map(portions.map((p) => [p.id, p]));

    return ingredients.reduce((ai, bi) => {
      const portionFound = portionsMap.get(bi.id);

      if (portionFound) {
        return (
          ai +
          portionFound.ingredients.reduce((a, b) => {
            const currentValueFound = stocksMap.get(b.id)?.currentValue || 0;
            return a + currentValueFound * b.quantity;
          }, 0) *
            bi.quantity
        );
      } else {
        const currentValueFound = stocksMap.get(bi.id)?.currentValue || 0;
        return ai + currentValueFound * bi.quantity;
      }
    }, 0);
  }, [ingredients, stocks, portions]);
};
