import type { Handler } from "domain/entities/data/handlers/handler.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const payroll = (collection: Collection) => collection.handlers;

const initialState: Handler[] = [];

export const controllersSlice = createSlice({
  name: "handlers",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Handler[]>) => action.payload,
    add: (state, action: PayloadAction<Handler>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Handler>) => {
      const controller = action.payload;
      return state.map((s) => (s.id === controller.id ? controller : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => payroll(action.payload));
  },
});

export const { add, edit, remove, clean, change } = controllersSlice.actions;
export default controllersSlice.reducer;
