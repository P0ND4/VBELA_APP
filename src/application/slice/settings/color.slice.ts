import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const color = (collection: Collection) => collection.color;

const initialState: number = 0;

export const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<number>) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => 0);
    builder.addCase(changeAll, (_, action) => color(action.payload!));
  },
});

export const { change } = colorSlice.actions;
export default colorSlice.reducer;
