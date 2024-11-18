import type { Supplier } from "domain/entities/data/suppliers/supplier.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const suppliers = (collection: Collection) => collection.suppliers;

const initialState: Supplier[] = [];

export const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Supplier[]>) => action.payload,
    add: (state, action: PayloadAction<Supplier>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Supplier>) => {
      const supplier = action.payload;
      return state.map((s) => (s.id === supplier.id ? supplier : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => suppliers(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = supplierSlice.actions;
export default supplierSlice.reducer;
