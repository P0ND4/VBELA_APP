import { createSlice } from "@reduxjs/toolkit";
import { cleanAll } from "application/store/actions";

export const sessionSlice = createSlice({
  name: "session",
  initialState: false,
  reducers: {
    active: () => true,
    inactive: () => false,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => false);
  },
});

export const { active, inactive } = sessionSlice.actions;
export default sessionSlice.reducer;
