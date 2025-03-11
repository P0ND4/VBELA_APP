import type { Nomenclature } from "domain/entities/data/reservations/nomenclature.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const nomenclatures = (collection: Collection) => collection.nomenclatures;

const initialState: Nomenclature[] = [];

export const nomenclaturesSlice = createSlice({
  name: "nomenclatures",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Nomenclature[]>) => action.payload,
    add: (state, action: PayloadAction<Nomenclature>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Nomenclature>) => {
      const nomenclature = action.payload;
      const index = state.findIndex((s) => s.id === nomenclature.id);
      if (index !== -1) state[index] = nomenclature;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => nomenclatures(action.payload));
  },
});

export const { add, edit, remove, clean, change } = nomenclaturesSlice.actions;
export default nomenclaturesSlice.reducer;
