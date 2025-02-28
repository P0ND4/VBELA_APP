import type { Element } from "domain/entities/data/common/element.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";
import { Group } from "domain/entities/data";

const products = (collection: Collection) => collection.products;

const initialState: Element[] = [];

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Element[]>) => action.payload,
    add: (state, action: PayloadAction<Element>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Element>) => {
      const productAndService = action.payload;
      return state.map((s) => (s.id === productAndService.id ? productAndService : s));
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

      return state.map((product) => {
        const found = discountMap.get(product.id);
        return found ? { ...product, stock: product.stock! - found.quantity } : product;
      });
    },
    removeStock: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      return state.map((product) => ({
        ...product,
        stockIDS: product.stockIDS?.filter((stock) => !ids.includes(stock)),
      }));
    },
    removeRecipe: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      return state.map((product) => ({
        ...product,
        packageIDS: product.packageIDS?.filter((recipe) => !ids.includes(recipe)),
      }));
    },
    updateSubcategories: (state, action: PayloadAction<Group>) => {
      const group = action.payload;
      return state.map((product) => ({
        ...product,
        subcategories: product.subcategories.filter(
          (sub) =>
            sub.category !== group.id || group.subcategories.some((s) => s.id === sub.subcategory),
        ),
      }));
    },
    removeCategory: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.map((product) => ({
        ...product,
        categories: product.categories.filter((c) => c !== id),
        subcategories: product.subcategories.filter((s) => s.category !== id),
      }));
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => products(action.payload));
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
} = productsSlice.actions;
export default productsSlice.reducer;
