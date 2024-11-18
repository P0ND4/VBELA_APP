import type { CollaborativeWorkStatus } from "domain/entities/data/collaborators/collaborative.work.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cleanAll } from "application/store/actions";

const initialState: CollaborativeWorkStatus = {
  working: false,
  connection: null,
  disconnection: null,
};

export const collaborativeWorkSlice = createSlice({
  name: "collaborative-work-status",
  initialState,
  reducers: {
    active: (_, action: PayloadAction<CollaborativeWorkStatus>) => action.payload,
    inactive: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => initialState);
  },
});

export const { active, inactive } = collaborativeWorkSlice.actions;
export default collaborativeWorkSlice.reducer;
