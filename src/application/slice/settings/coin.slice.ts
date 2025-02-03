import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const coin = (collection: Collection) => collection.coin;

export const coinSlice = createSlice({
  name: "coin",
  initialState: "USD",
  reducers: {
    change: (_, action: PayloadAction<string>) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => "USD");
    builder.addCase(changeAll, (_, action) => coin(action.payload));
  },
});

export const { change } = coinSlice.actions;
export default coinSlice.reducer;
