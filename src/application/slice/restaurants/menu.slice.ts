
import type { Product } from "domain/entities/data/common/element.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const menu = (collection: Collection) => collection.menu;

const initialState: Product[] = [];

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Product[]>) => action.payload,
    add: (state, action: PayloadAction<Product>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Product>) => {
      const menu = action.payload;
      return state.map((s) => (s.id === menu.id ? menu : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => menu(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = menuSlice.actions;
export default menuSlice.reducer;
