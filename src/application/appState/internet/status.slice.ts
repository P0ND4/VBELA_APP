import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Status {
  Online = "En línea",
  Offline = "Sin conexión",
  Syncing = "Sincronizando",
  Synchronized = "Sincronizado",
}

interface InternetState {
  status: Status;
}

const initialState: InternetState = {
  status: Status.Online,
};

export const internetSlice = createSlice({
  name: "internet-status",
  initialState,
  reducers: {
    change: (state, action: PayloadAction<Status>) => {
      state.status = action.payload;
    },
    clean: (state) => {
      state.status = initialState.status;
    },
  },
});

export const { change, clean } = internetSlice.actions;
export default internetSlice.reducer;
