const { createSlice } = require('@reduxjs/toolkit');

export const informationSlice = createSlice({
  name: 'tables',
  initialState: [],
  reducers: {
    add: (state, action) => void (state = state.push(action.payload)),
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((table) => table.id === id);
      state.splice(index, 1);
    },
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((t) => t.id === id);
      state[index] = { ...state[index], ...data };
    },
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = []
  }
});

export const { change, clean, add, remove, edit } = informationSlice.actions;
export default informationSlice.reducer;