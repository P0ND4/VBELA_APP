import type { Expense } from "domain/entities/data/suppliers/expense.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const expenses = (collection: Collection) => collection.expenses;

const initialState: Expense[] = [];

export const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Expense[]>) => action.payload,
    add: (state, action: PayloadAction<Expense>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Expense>) => {
      const expense = action.payload;
      return state.map((s) => (s.id === expense.id ? expense : s));
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
    builder.addCase(changeAll, (_, action) => expenses(action.payload!));
  },
});

export const { clean, change, add, edit, removeIDS, removeREF } = expensesSlice.actions;
export default expensesSlice.reducer;
