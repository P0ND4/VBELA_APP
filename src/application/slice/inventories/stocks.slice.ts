import type { Stock, Group } from "domain/entities/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const stocks = (collection: Partial<Collection>) => collection?.stocks ?? [];
const initialState: Stock[] = [];

export const informationSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Stock[]>) => action.payload,
    add: (state, action: PayloadAction<Stock>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Stock>) => {
      const stock = action.payload;
      const index = state.findIndex((s) => s.id === stock.id);
      if (index !== -1) state[index] = stock;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeByInventoryID: (state, action: PayloadAction<{ inventoryID: string }>) => {
      const { inventoryID } = action.payload;
      return state.filter((s) => s.inventoryID !== inventoryID);
    },
    updateSubcategories: (state, action: PayloadAction<Group>) => {
      const group = action.payload;
      state.forEach((product) => {
        product.subcategories = product.subcategories.filter(
          (sub) =>
            sub.category !== group.id || group.subcategories.some((s) => s.id === sub.subcategory),
        );
      });
    },
    removeCategory: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.forEach((product) => {
        product.categories = product.categories.filter((c) => c !== id);
        product.subcategories = product.subcategories.filter((s) => s.category !== id);
      });
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => stocks(action.payload));
  },
});

export const {
  add,
  edit,
  remove,
  clean,
  change,
  removeByInventoryID,
  updateSubcategories,
  removeCategory,
} = informationSlice.actions;
export default informationSlice.reducer;
