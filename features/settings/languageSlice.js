const { createSlice } = require('@reduxjs/toolkit');

export const languageSlice = createSlice({
  name: 'language',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = languageSlice.actions;
export default languageSlice.reducer;