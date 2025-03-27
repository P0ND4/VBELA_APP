import type { Economy } from "domain/entities/data/economies/economy.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const economies = (collection: Collection) => collection.economies;

const initialState: Economy[] = [];

export const economiesSlice = createSlice({
  name: "economies",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Economy[]>) => action.payload,
    add: (state, action: PayloadAction<Economy>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Economy>) => {
      const supplier = action.payload;
      const index = state.findIndex((s) => s.id === supplier.id);
      if (index !== -1) state[index] = supplier;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => economies(action.payload));
  },
});

export const { clean, change, add, edit, remove } = economiesSlice.actions;
export default economiesSlice.reducer;
