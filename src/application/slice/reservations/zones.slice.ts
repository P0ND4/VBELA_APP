import type { Zone } from "domain/entities/data/reservations/zone.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const zones = (collection: Collection) => collection.zones;

const initialState: Zone[] = [];
export const zonesSlice = createSlice({
  name: "zones",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Zone[]>) => action.payload,
    add: (state, action: PayloadAction<Zone>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Zone>) => {
      const zone = action.payload;
      return state.map((s) => (s.id === zone.id ? zone : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => zones(action.payload!));
  },
});

export const { add, edit, remove, clean, change } = zonesSlice.actions;
export default zonesSlice.reducer;
