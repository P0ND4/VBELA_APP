import type { Group } from "domain/entities/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const stockGroup = (collection: Partial<Collection>) => collection?.stockGroup ?? [];

const initialState: Group[] = [];

export const stockGroupSlice = createSlice({
  name: "stock-group",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Group[]>) => action.payload,
    add: (state, action: PayloadAction<Group>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Group>) => {
      const group = action.payload;
      const index = state.findIndex((s) => s.id === group.id);
      if (index !== -1) state[index] = group;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeByInventoryID: (state, action: PayloadAction<{ inventoryID: string }>) => {
      const { inventoryID } = action.payload;
      return state.filter((s) => s.ownerID !== inventoryID);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => stockGroup(action.payload));
  },
});

export const { add, edit, remove, removeByInventoryID, clean, change } = stockGroupSlice.actions;
export default stockGroupSlice.reducer;
