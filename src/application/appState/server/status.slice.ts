import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum ServerStatus {
  Unknown = "unknown",
  Online = "online",
  Unreachable = "unreachable",
}

type ServerStatusState = {
  status: ServerStatus;
};

const initialState: ServerStatusState = {
  status: ServerStatus.Unknown,
};

export const serverStatusSlice = createSlice({
  name: "server-status",
  initialState,
  reducers: {
    setServerStatus: (state, action: PayloadAction<ServerStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { setServerStatus } = serverStatusSlice.actions;
export default serverStatusSlice.reducer;
