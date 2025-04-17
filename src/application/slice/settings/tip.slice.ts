import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const tip = (collection: Collection) => collection.tip;

const initialState: number = 0;

export const tipSlice = createSlice({
  name: "tip",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<number>) => action.payload,
    clean: () => 0,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => 0);
    builder.addCase(changeAll, (_, action) => tip(action.payload));
  },
});

export const { change, clean } = tipSlice.actions;
export default tipSlice.reducer;
