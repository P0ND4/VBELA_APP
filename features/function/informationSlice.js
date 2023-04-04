const { createSlice } = require("@reduxjs/toolkit");

export const informationSlice = createSlice({
  name: "group-information",
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

export const { active, inactive } = informationSlice.actions;
export default informationSlice.reducer;
