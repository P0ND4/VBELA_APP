import type { Invoice } from "domain/entities/data/customers/invoice.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

export const invoices = (collection: Collection) => collection.invoices;

const initialState: Invoice[] = [];

export const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Invoice[]>) => action.payload,
    add: (state, action: PayloadAction<Invoice>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Invoice>) => {
      const invoice = action.payload;
      return state.map((s) => (s.id === invoice.id ? invoice : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => invoices(action.payload));
  },
});

export const { add, edit, remove, clean, change } = invoicesSlice.actions;
export default invoicesSlice.reducer;
