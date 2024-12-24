import type { Kitchen } from "domain/entities/data/kitchens";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const kitchens = (collection: Collection) => collection.kitchens;

const initialState: Kitchen[] = [];

export const kitchensSlice = createSlice({
  name: "kitchens",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Kitchen[]>) => action.payload,
    add: (state, action: PayloadAction<Kitchen>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Kitchen>) => {
      const kitchen = action.payload;
      return state.map((s) => (s.id === kitchen.id ? kitchen : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => kitchens(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = kitchensSlice.actions;
export default kitchensSlice.reducer;
