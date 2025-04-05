import { useAppSelector } from "application/store/hook";
import { Portion } from "domain/entities/data";
import { Selection } from "domain/entities/data/common";

export const useExtractPortion = () => {
  const portions = useAppSelector((state) => state.portions);
  const recipes = useAppSelector((state) => state.recipes);

  const portionsMap = new Map(portions.map((p) => [p.id, p]));

  const extractPortion = (selection: Selection[]): Portion[] => {
    const activeSelections = selection.filter((s) => s.activeStock);

    const deductions = activeSelections.flatMap(({ packageIDS, quantity: selectionQuantity }) => {
      return recipes
        .filter(({ id }) => packageIDS?.includes(id))
        .flatMap((recipe) => recipe.ingredients)
        .filter((ingredient) => portionsMap.has(ingredient.id))
        .map((ingredient) => {
          const portion = portionsMap.get(ingredient.id)!;
          const amountToDeduct = selectionQuantity * ingredient.quantity;
          return {
            portionId: portion.id,
            amountToDeduct,
          };
        });
    });

    const deductionMap = deductions.reduce((acc, { portionId, amountToDeduct }) => {
      acc.set(portionId, (acc.get(portionId) || 0) + amountToDeduct);
      return acc;
    }, new Map<string, number>());

    const result = Array.from(deductionMap.entries()).map(([portionId, totalDeduction]) => {
      const originalPortion = portionsMap.get(portionId)!;
      return {
        ...originalPortion,
        quantity: originalPortion.quantity - totalDeduction,
        modificationDate: new Date().getTime(),
      };
    });

    return result;
  };

  return extractPortion;
};
