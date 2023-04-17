const { createSlice } = require('@reduxjs/toolkit');

export const menuSlice = createSlice({
  name: 'menu',
  initialState: [],
  reducers: {
    change: (state, action) => state = action.payload,
    add: (state, action) => void (state = state.push(action.payload)),
    clean: (state, action) => state = []
  }
});

export const { clean, add, change } = menuSlice.actions;
export default menuSlice.reducer;