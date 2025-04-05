import type { Group, Portion } from "domain/entities/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const portions = (collection: Collection) => collection.portions;

const initialState: Portion[] = [];

export const portionsSlice = createSlice({
  name: "portions",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Portion[]>) => action.payload,
    add: (state, action: PayloadAction<Portion>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Portion>) => {
      const recipe = action.payload;
      const index = state.findIndex((s) => s.id === recipe.id);
      if (index !== -1) state[index] = recipe;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeByInventoryID: (state, action: PayloadAction<{ inventoryID: string }>) => {
      const { inventoryID } = action.payload;
      return state.filter((s) => s.inventoryID !== inventoryID);
    },
    removeIngredient: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.forEach((recipe) => {
        recipe.ingredients = recipe.ingredients.filter((ingredient) => ingredient.id !== id);
      });
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
    builder.addCase(changeAll, (_, action) => portions(action.payload));
  },
});

export const {
  add,
  edit,
  remove,
  clean,
  change,
  removeIngredient,
  removeByInventoryID,
  updateSubcategories,
  removeCategory,
} = portionsSlice.actions;
export default portionsSlice.reducer;
