const { createSlice } = require("@reduxjs/toolkit");

export const rosterSlice = createSlice({
  name: "roster",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((r) => r.id === id);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex(r => r.id === id);
      state.splice(index, 1);
    },
    clean: (state, action) => [],
  },
});

export const { add, edit, remove, clean, change } = rosterSlice.actions;
export default rosterSlice.reducer;