import type { Collaborator } from "domain/entities/data/collaborators/collaborator.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const collaborators = (collection: Collection) => collection.collaborators;

const initialState: Collaborator[] = [];

export const collaboratorsSlice = createSlice({
  name: "collaborators",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Collaborator[]>) => action.payload,
    add: (state, action: PayloadAction<Collaborator>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Collaborator>) => {
      const collaborator = action.payload;
      return state.map((s) => (s.id === collaborator.id ? collaborator : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => collaborators(action.payload));
  },
});

export const { add, edit, remove, clean, change } = collaboratorsSlice.actions;
export default collaboratorsSlice.reducer;
