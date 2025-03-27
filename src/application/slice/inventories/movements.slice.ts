import type { Movement } from "domain/entities/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const movements = (collection: Collection) => collection.movements;
const initialState: Movement[] = [];

export const movementsSlice = createSlice({
  name: "movements",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Movement[]>) => action.payload,
    add: (state, action: PayloadAction<Movement>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Movement>) => {
      const stock = action.payload;
      const index = state.findIndex((s) => s.id === stock.id);
      if (index !== -1) state[index] = stock;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => movements(action.payload));
  },
});

export const { add, edit, remove, clean, change } = movementsSlice.actions;
export default movementsSlice.reducer;
