import type { PSCategoryHierarchy } from "domain/entities/data/stores/category.hierarchy.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const categoryHierarchy = (collection: Collection) =>
  collection.productsAndServicesCategoryHierarchy;

const initialState: PSCategoryHierarchy[] = [];

export const categoryHierarchySlice = createSlice({
  name: "products-and-services-category-hierarchy",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<PSCategoryHierarchy[]>) => action.payload,
    add: (state, action: PayloadAction<PSCategoryHierarchy>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<PSCategoryHierarchy>) => {
      const category = action.payload;
      return state.map((s) => (s.id === category.id ? category : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => categoryHierarchy(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = categoryHierarchySlice.actions;
export default categoryHierarchySlice.reducer;
