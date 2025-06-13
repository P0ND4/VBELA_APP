import type { Handler } from "domain/entities/data/handlers/handler.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const handlers = (collection: Partial<Collection>) => collection?.handlers ?? [];

const initialState: Handler[] = [];

export const handlersSlice = createSlice({
  name: "handlers",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Handler[]>) => action.payload,
    add: (state, action: PayloadAction<Handler>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Handler>) => {
      const handler = action.payload;
      const index = state.findIndex((s) => s.id === handler.id);
      if (index !== -1) state[index] = handler;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => handlers(action.payload));
  },
});

export const { add, edit, remove, clean, change } = handlersSlice.actions;
export default handlersSlice.reducer;
