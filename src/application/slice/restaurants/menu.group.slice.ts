import type { Group } from "domain/entities/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const menuGroup = (collection: Partial<Collection>) => collection?.menuGroup ?? [];

const initialState: Group[] = [];

export const menuGroupSlice = createSlice({
  name: "menu-group",
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
    removeByLocationID: (state, action: PayloadAction<{ locationID: string }>) => {
      const { locationID } = action.payload;
      return state.filter((s) => s.ownerID !== locationID);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => menuGroup(action.payload));
  },
});

export const { add, edit, remove, removeByLocationID, clean, change } = menuGroupSlice.actions;
export default menuGroupSlice.reducer;
