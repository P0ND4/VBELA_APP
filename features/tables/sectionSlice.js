const { createSlice } = require('@reduxjs/toolkit');

export const menuSlice = createSlice({
  name: 'section',
  initialState: [],
  reducers: {
    clean: (state, action) => state = []
  }
});

export const { clean } = menuSlice.actions;
export default menuSlice.reducer;