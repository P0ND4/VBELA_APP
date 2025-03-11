import type { Recipe } from "domain/entities/data/inventories";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const recipes = (collection: Collection) => collection.recipes;

const initialState: Recipe[] = [];

export const informationSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Recipe[]>) => action.payload,
    add: (state, action: PayloadAction<Recipe>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Recipe>) => {
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
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => recipes(action.payload));
  },
});

export const { add, edit, remove, clean, change, removeIngredient, removeByInventoryID } =
  informationSlice.actions;
export default informationSlice.reducer;
