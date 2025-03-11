import type { Movement, Stock } from "domain/entities/data/inventories/stock.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const stocks = (collection: Collection) => collection.stocks;
const initialState: Stock[] = [];

const updateStockMovements = (
  state: Stock[],
  movements: Movement[],
  updateFn: (stock: Stock, movement: Movement) => Stock,
) => {
  const movementMap = new Map(movements.map((m) => [m.stockID, m]));
  return state.map((stock) => {
    const movement = movementMap.get(stock.id);
    return movement ? updateFn(stock, movement) : stock;
  });
};

const calculateQuantity = (movements: Movement[]) =>
  movements.reduce((acc, m) => acc + m.quantity, 0);

export const informationSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Stock[]>) => action.payload,
    add: (state, action: PayloadAction<Stock>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Stock>) => {
      const stock = action.payload;
      const index = state.findIndex((s) => s.id === stock.id);
      if (index !== -1) state[index] = stock;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeByInventoryID: (state, action: PayloadAction<{ inventoryID: string }>) => {
      const { inventoryID } = action.payload;
      return state.filter((s) => s.inventoryID !== inventoryID);
    },
    addMovement: (state, action: PayloadAction<Movement[]>) =>
      updateStockMovements(state, action.payload, (stock, movement) => {
        const movements = [...stock.movements, movement];
        return {
          ...stock,
          quantity: calculateQuantity(movements),
          currentValue: movement.currentValue,
          movements,
        };
      }),
    editMovement: (state, action: PayloadAction<Movement[]>) =>
      updateStockMovements(state, action.payload, (stock, movement) => {
        const movements = stock.movements.map((m) => (m.id === movement.id ? movement : m));
        return {
          ...stock,
          quantity: calculateQuantity(movements),
          movements,
        };
      }),
    removeMovement: (state, action: PayloadAction<Movement[]>) =>
      updateStockMovements(state, action.payload, (stock, movement) => {
        const movements = stock.movements.filter((m) => m.id !== movement.id);
        return {
          ...stock,
          quantity: calculateQuantity(movements),
          movements,
        };
      }),
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => stocks(action.payload));
  },
});

export const {
  add,
  edit,
  remove,
  addMovement,
  editMovement,
  removeMovement,
  clean,
  change,
  removeByInventoryID,
} = informationSlice.actions;
export default informationSlice.reducer;
