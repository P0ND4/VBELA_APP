import type { Element } from "domain/entities/data/common/element.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const productsAndServices = (collection: Collection) => collection.productsAndServices;

const initialState: Element[] = [];

export const productsAndServicesSlice = createSlice({
  name: "products-and-services",
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
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => productsAndServices(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = productsAndServicesSlice.actions;
export default productsAndServicesSlice.reducer;
