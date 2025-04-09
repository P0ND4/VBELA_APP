import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Status {
  Active = "Activo",
  Inactive = "Inactivo",
}

type StateController = {
  status: Status;
  start: number | null;
};

const initialState: StateController = {
  status: Status.Inactive,
  start: null,
};

export const stateControllerSlice = createSlice({
  name: "state-controller",
  initialState,
  reducers: {
    active: (_, action: PayloadAction<{ start: number }>) => {
      const { start } = action.payload;
      return { status: Status.Active, start };
    },
    clean: () => initialState,
  },
});

export const { active, clean } = stateControllerSlice.actions;
export default stateControllerSlice.reducer;
