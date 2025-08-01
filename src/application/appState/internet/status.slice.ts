import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum InternetStatus {
  Online = "En línea",
  Offline = "Sin conexión",
  Syncing = "Sincronizando",
  Synchronized = "Sincronizado",
}

interface InternetState {
  status: InternetStatus;
}

const initialState: InternetState = {
  status: InternetStatus.Online,
};

export const internetSlice = createSlice({
  name: "internet-status",
  initialState,
  reducers: {
    change: (state, action: PayloadAction<InternetStatus>) => {
      state.status = action.payload;
    },
    clean: (state) => {
      state.status = initialState.status;
    },
  },
});

export const { change, clean } = internetSlice.actions;
export default internetSlice.reducer;
