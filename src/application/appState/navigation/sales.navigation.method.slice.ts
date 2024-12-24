import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum SalesNavigation {
  Replace = "replace",
  Navigate = "navigate",
}

export const salesNavigationMethodSlice = createSlice({
  name: "sales-navigation-method",
  initialState: SalesNavigation.Navigate as SalesNavigation,
  reducers: {
    change: (_, action: PayloadAction<SalesNavigation>) => action.payload,
    clean: () => SalesNavigation.Navigate,
  },
});

export const { change, clean } = salesNavigationMethodSlice.actions;
export default salesNavigationMethodSlice.reducer;
