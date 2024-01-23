const { createSlice } = require("@reduxjs/toolkit");

export const recipesSlice = createSlice({
  name: "recipes",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((m) => m.id === id);
      state[index] = data;
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((m) => m.id === id);
      state.splice(index, 1);
    },
    clean: (state, action) => (state = []),
  },
});

export const { clean, change, add, edit, remove } = recipesSlice.actions;
export default recipesSlice.reducer;