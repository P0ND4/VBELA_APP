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
      return state.map((s) => (s.id === recipe.id ? recipe : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeIngredient: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.filter((ingredient) => ingredient.id !== id),
      }));
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => recipes(action.payload));
  },
});

export const { add, edit, remove, clean, change, removeIngredient } = informationSlice.actions;
export default informationSlice.reducer;
