import type { Movement, Stock } from "domain/entities/data/inventories/stock.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const stocks = (collection: Collection) => collection.stocks;
const initialState: Stock[] = [];

const updateStockMovements = (
  state: Stock[],
  movements: Movement[],
  updater: (stock: Stock, found: Movement) => Stock,
) => {
  const movementMap = new Map(movements.map((m) => [m.stockID, m]));
  return state.map((stock) => {
    const found = movementMap.get(stock.id);
    return found ? updater(stock, found) : stock;
  });
};

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
      return state.map((s) => (s.id === stock.id ? stock : s));
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
      updateStockMovements(state, action.payload, (stock, found) => ({
        ...stock,
        currentValue: found.currentValue,
        movements: [...stock.movements, found],
      })),
    editMovement: (state, action: PayloadAction<Movement[]>) =>
      updateStockMovements(state, action.payload, (stock, found) => ({
        ...stock,
        movements: stock.movements.map((m) => (m.id === found.id ? found : m)),
      })),
    removeMovement: (state, action: PayloadAction<Movement[]>) =>
      updateStockMovements(state, action.payload, (stock, found) => ({
        ...stock,
        movements: stock.movements.filter((m) => m.id !== found.id),
      })),
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
