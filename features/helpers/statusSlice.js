const { createSlice } = require("@reduxjs/toolkit");

export const statusSlice = createSlice({
  name: "helper-status",
  initialState: {
    active: false,
  },
  reducers: {
    active: (state, action) =>
      (state = {
        active: true,
        connection: new Date().getTime(), 
        ...action.payload,
      }),
    inactive: (state, action) =>
      (state = {
        ...state,
        disconnection: new Date().getTime(),
        active: false,
      }),
  },
});

export const { active, inactive } = statusSlice.actions;
export default statusSlice.reducer;
