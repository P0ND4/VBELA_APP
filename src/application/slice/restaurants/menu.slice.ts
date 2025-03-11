import type { Element } from "domain/entities/data/common/element.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";
import { Group } from "domain/entities/data";

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
      const index = state.findIndex((s) => s.id === menu.id);
      if (index !== -1) state[index] = menu;
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
      state.forEach((menu) => {
        const found = discountMap.get(menu.id);
        if (found) menu.stock -= found.quantity;
      });
    },
    removeStock: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      state.forEach((menu) => {
        menu.stockIDS = menu.stockIDS?.filter((stock) => !ids.includes(stock));
      });
    },
    removeRecipe: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      state.forEach((menu) => {
        menu.packageIDS = menu.packageIDS?.filter((recipe) => !ids.includes(recipe));
      });
    },
    updateSubcategories: (state, action: PayloadAction<Group>) => {
      const group = action.payload;
      state.forEach((menu) => {
        menu.subcategories = menu.subcategories.filter(
          (sub) =>
            sub.category !== group.id || group.subcategories.some((s) => s.id === sub.subcategory),
        );
      });
    },
    removeCategory: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.forEach((menu) => {
        menu.categories = menu.categories.filter((c) => c !== id);
        menu.subcategories = menu.subcategories.filter((s) => s.category !== id);
      });
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
  updateSubcategories,
  removeCategory,
} = menuSlice.actions;
export default menuSlice.reducer;
