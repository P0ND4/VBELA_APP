import type { Table } from "domain/entities/data/restaurants/table.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const tables = (collection: Collection) => collection.tables;

const initialState: Table[] = [];

export const tablesSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Table[]>) => action.payload,
    addMultiple: (state, action: PayloadAction<Table[]>) => [...state, ...action.payload],
    add: (state, action: PayloadAction<Table>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Table>) => {
      const table = action.payload;
      return state.map((s) => (s.id === table.id ? table : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    removeByRestaurantID: (state, action: PayloadAction<{ restaurantID: string }>) => {
      const { restaurantID } = action.payload;
      return state.filter((s) => s.restaurantID !== restaurantID);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => tables(action.payload));
  },
});

export const { add, addMultiple, edit, remove, clean, change, removeByRestaurantID } =
  tablesSlice.actions;
export default tablesSlice.reducer;
