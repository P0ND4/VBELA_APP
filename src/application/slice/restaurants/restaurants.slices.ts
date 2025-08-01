import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";
import { Location } from "domain/entities/data/common";

const stores = (collection: Partial<Collection>) => collection?.restaurants ?? [];

const initialState: Location[] = [];

export const restaurantsSlice = createSlice({
  name: "restaurants",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Location[]>) => action.payload,
    add: (state, action: PayloadAction<Location>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Location>) => {
      const restaurant = action.payload;
      const index = state.findIndex((r) => r.id === restaurant.id);
      if (index !== -1) state[index] = restaurant;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((r) => r.id !== id);
    },
    removeInventory: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.forEach((r) => {
        r.inventories = r.inventories.filter((i) => i !== id);
      });
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => stores(action.payload));
  },
});

export const { add, edit, remove, clean, change, removeInventory } = restaurantsSlice.actions;
export default restaurantsSlice.reducer;
