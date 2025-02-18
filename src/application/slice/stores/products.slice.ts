import type { Element } from "domain/entities/data/common/element.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

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

      return state.map((pas) => {
        const found = discountMap.get(pas.id);
        return found ? { ...pas, stock: pas.stock! - found.quantity } : pas;
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
} = productsSlice.actions;
export default productsSlice.reducer;
