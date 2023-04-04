const { createSlice } = require('@reduxjs/toolkit');

export const informationSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = null
  }
});

export const { change, clean } = informationSlice.actions;
export default informationSlice.reducer;