import type { Sync } from "domain/entities/data/user/sync.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Sync = {
  lastConnection: null,
  connected: false,
  ping: null,
  rooms: [],
};

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Sync>) => action.payload,
    clean: () => initialState,
  },
});

export const { change, clean } = syncSlice.actions;
export default syncSlice.reducer;
