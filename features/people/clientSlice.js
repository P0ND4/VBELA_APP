const { createSlice } = require("@reduxjs/toolkit");

export const clientSlice = createSlice({
  name: "clients",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((p) => p.id === id);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex(p => p.id === id);
      state.splice(index, 1);
    },
    clean: (state, action) => [],
  },
});

export const { add, edit, remove, clean, change } = clientSlice.actions;
export default clientSlice.reducer;