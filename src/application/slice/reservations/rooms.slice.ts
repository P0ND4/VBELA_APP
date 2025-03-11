import type { Room } from "domain/entities/data/reservations/room.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const rooms = (collection: Collection) => collection.rooms;

const initialState: Room[] = [];

export const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Room[]>) => action.payload,
    add: (state, action: PayloadAction<Room>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Room>) => {
      const room = action.payload;
      const index = state.findIndex((s) => s.id === room.id);
      if (index !== -1) state[index] = room;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => rooms(action.payload));
  },
});

export const { add, edit, remove, clean, change } = roomsSlice.actions;
export default roomsSlice.reducer;
