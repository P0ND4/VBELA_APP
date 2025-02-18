import type { Element } from "domain/entities/data/common/element.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const menu = (collection: Collection) => collection.menu;

const initialState: Element[] = [];

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Element[]>) => action.payload,
    add: (state, action: PayloadAction<Element>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Element>) => {
      const menu = action.payload;
      return state.map((s) => (s.id === menu.id ? menu : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeByLocationID: (state, action: PayloadAction<{ locationID: string }>) => {
      const { locationID } = action.payload;
      return state.filter((s) => s.locationID !== locationID);
    },
    discount: (state, action: PayloadAction<{ id: string; quantity: number }[]>) => {
      const discounts = action.payload;
      const discountMap = new Map(discounts.map((m) => [m.id, m]));
      return state.map((menu) => {
        const found = discountMap.get(menu.id);
        return found ? { ...menu, stock: menu.stock! - found.quantity } : menu;
      });
    },
    removeStock: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      return state.map((products) => ({
        ...products,
        stockIDS: products.stockIDS?.filter((stock) => !ids.includes(stock)),
      }));
    },
    removeRecipe: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      return state.map((products) => ({
        ...products,
        packageIDS: products.packageIDS?.filter((recipe) => !ids.includes(recipe)),
      }));
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => menu(action.payload));
  },
});

export const {
  add,
  edit,
  remove,
  clean,
  change,
  discount,
  removeStock,
  removeRecipe,
  removeByLocationID,
} = menuSlice.actions;
export default menuSlice.reducer;
