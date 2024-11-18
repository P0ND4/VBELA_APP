import type { Stock } from "domain/entities/data/inventories/stock.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const stocks = (collection: Collection) => collection.stocks;

const initialState: Stock[] = [];

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
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => stocks(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = informationSlice.actions;
export default informationSlice.reducer;
