import type { Order } from "domain/entities/data/common/order.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const sales = (collection: Collection) => collection.sales;

const initialState: Order[] = [];

export const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Order[]>) => action.payload,
    add: (state, action: PayloadAction<Order>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Order>) => {
      const sale = action.payload;
      return state.map((s) => (s.id === sale.id ? sale : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => sales(action.payload));
  },
});

export const { add, edit, remove, clean, change } = salesSlice.actions;
export default salesSlice.reducer;
