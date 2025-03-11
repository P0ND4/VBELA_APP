import type { Inventory } from "domain/entities/data/inventories";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const inventories = (collection: Collection) => collection.inventories;

const initialState: Inventory[] = [];

export const informationSlice = createSlice({
  name: "inventories",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Inventory[]>) => action.payload,
    add: (state, action: PayloadAction<Inventory>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Inventory>) => {
      const inventory = action.payload;
      const index = state.findIndex((s) => s.id === inventory.id);
      if (index !== -1) state[index] = inventory;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => inventories(action.payload));
  },
});

export const { add, edit, remove, clean, change } = informationSlice.actions;
export default informationSlice.reducer;
