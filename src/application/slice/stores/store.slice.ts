import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";
import { Location } from "domain/entities/data/common";

const stores = (collection: Collection) => collection.stores;

const initialState: Location[] = [];

export const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Location[]>) => action.payload,
    addMultiple: (state, action: PayloadAction<Location[]>) => [...state, ...action.payload],
    add: (state, action: PayloadAction<Location>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Location>) => {
      const store = action.payload;
      return state.map((s) => (s.id === store.id ? store : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => stores(action.payload!));
  },
});

export const { add, addMultiple, edit, remove, clean, change } = storesSlice.actions;
export default storesSlice.reducer;
