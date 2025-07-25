import type { Order } from "domain/entities/data/common/order.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const orders = (collection: Partial<Collection>) => collection?.orders ?? [];

const initialState: Order[] = [];

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Order[]>) => action.payload,
    add: (state, action: PayloadAction<Order>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Order>) => {
      const order = action.payload;
      const index = state.findIndex((s) => s.id === order.id);
      if (index !== -1) state[index] = order;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => orders(action.payload));
  },
});

export const { add, edit, remove, clean, change } = ordersSlice.actions;
export default ordersSlice.reducer;
