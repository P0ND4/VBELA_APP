const { createSlice } = require("@reduxjs/toolkit");

export const informationStorageSlice = createSlice({
  name: "information-storage",
  initialState: {},
  reducers: {
    edit: (state, action) => state = { ...action.payload }
  },
});

export const { edit } = informationStorageSlice.actions;
export default informationStorageSlice.reducer;
