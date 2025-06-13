import type { EconomicGroup } from "domain/entities/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const economicGroup = (collection: Partial<Collection>) => collection?.economicGroup ?? [];

const initialState: EconomicGroup[] = [];

export const economicGroupSlice = createSlice({
  name: "economic-group",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<EconomicGroup[]>) => action.payload,
    add: (state, action: PayloadAction<EconomicGroup>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<EconomicGroup>) => {
      const group = action.payload;
      const index = state.findIndex((g) => g.id === group.id);
      if (index !== -1) state[index] = group;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((g) => g.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => economicGroup(action.payload));
  },
});

export const { add, edit, remove, clean, change } = economicGroupSlice.actions;
export default economicGroupSlice.reducer;
