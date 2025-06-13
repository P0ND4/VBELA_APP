import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const mode = (collection: Partial<Collection>) => collection?.darkMode ?? false;

const initialState: boolean = false;

export const darkModeSlice = createSlice({
  name: "dark-mode",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<boolean>) => action.payload,
    toggle: (state) => !state,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => false);
    builder.addCase(changeAll, (_, action) => mode(action.payload));
  },
});

export const { change, toggle } = darkModeSlice.actions;
export default darkModeSlice.reducer;
