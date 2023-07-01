const { createSlice } = require('@reduxjs/toolkit');

const initialState = {
  lastConnection: null,
  connected: false,
  ping: null,
  rooms: []
};

export const informationSlice = createSlice({
  name: 'synchronization',
  initialState,
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = initialState
  }
});

export const { change, clean } = informationSlice.actions;
export default informationSlice.reducer;