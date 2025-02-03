import type { Purchase } from "domain/entities/data/suppliers/purchase.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const purchases = (collection: Collection) => collection.purchases;

const initialState: Purchase[] = [];

export const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Purchase[]>) => action.payload,
    add: (state, action: PayloadAction<Purchase>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Purchase>) => {
      const purchase = action.payload;
      return state.map((s) => (s.id === purchase.id ? purchase : s));
    },
    removeIDS: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      return state.filter((s) => !ids.includes(s.id));
    },
    removeREF: (state, action: PayloadAction<{ ref: string[] }>) => {
      const { ref } = action.payload;
      return state.filter((s) => !ref.includes(s.ref));
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => purchases(action.payload));
  },
});

export const { clean, change, add, edit, removeIDS, removeREF } = purchasesSlice.actions;
export default purchasesSlice.reducer;
