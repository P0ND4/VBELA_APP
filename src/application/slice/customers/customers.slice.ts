import type { Customer } from "domain/entities/data/customers/customer.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const customers = (collection: Collection) => collection.customers;

const initialState: Customer[] = [];

export const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Customer[]>) => action.payload,
    add: (state, action: PayloadAction<Customer>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Customer>) => {
      const customer = action.payload;
      return state.map((s) => (s.id === customer.id ? customer : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => customers(action.payload));
  },
});

export const { add, edit, remove, clean, change } = customersSlice.actions;
export default customersSlice.reducer;
