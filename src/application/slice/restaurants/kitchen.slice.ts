import type { Kitchen } from "domain/entities/data/restaurants/kitchen.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const kitchen = (collection: Collection) => collection.kitchen;

const initialState: Kitchen[] = [];

export const kitchenSlice = createSlice({
  name: "kitchen",
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
    builder.addCase(changeAll, (_, action) => kitchen(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = kitchenSlice.actions;
export default kitchenSlice.reducer;
