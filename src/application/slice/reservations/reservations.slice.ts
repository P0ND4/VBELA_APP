import type { Reservation } from "domain/entities/data/reservations/reservation.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const reservations = (collection: Partial<Collection>) => collection?.reservations ?? [];

const initialState: Reservation[] = [];

export const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Reservation[]>) => action.payload,
    add: (state, action: PayloadAction<Reservation>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Reservation>) => {
      const reservation = action.payload;
      const index = state.findIndex((s) => s.id === reservation.id);
      if (index !== -1) state[index] = reservation;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => reservations(action.payload));
  },
});

export const { add, edit, remove, clean, change } = reservationsSlice.actions;
export default reservationsSlice.reducer;
