import type { MCategoryHierarchy } from "domain/entities/data/restaurants/category.hierarchy.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const categoryHierarchy = (collection: Collection) => collection.menuCategoryHierarchy;

const initialState: MCategoryHierarchy[] = [];

export const categoryHierarchySlice = createSlice({
  name: "menu-category-hierarchy",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<MCategoryHierarchy[]>) => action.payload,
    add: (state, action: PayloadAction<MCategoryHierarchy>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<MCategoryHierarchy>) => {
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

export const { clean } = categoryHierarchySlice.actions;
export default categoryHierarchySlice.reducer;
