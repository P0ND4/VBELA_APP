const { createSlice } = require('@reduxjs/toolkit');

export const modeSlice = createSlice({
  name: 'mode',
  initialState: 'light',
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = modeSlice.actions;
export default modeSlice.reducer;