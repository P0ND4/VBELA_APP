const { createSlice } = require('@reduxjs/toolkit');

export const sessionSlice = createSlice({
  name: 'session',
  initialState: false,
  reducers: {
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { active, inactive } = sessionSlice.actions;
export default sessionSlice.reducer;