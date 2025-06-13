import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const tax = (collection: Partial<Collection>) => collection?.tax ?? 0;

const initialState: number = 0;

export const taxSlice = createSlice({
  name: "tax",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<number>) => action.payload,
    clean: () => 0,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => 0);
    builder.addCase(changeAll, (_, action) => tax(action.payload));
  },
});

export const { change, clean } = taxSlice.actions;
export default taxSlice.reducer;
