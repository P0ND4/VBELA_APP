const { createSlice } = require("@reduxjs/toolkit");

export const economySlice = createSlice({
  name: "economy",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { ref, data } = action.payload;
      const index = state.findIndex((e) => e.ref === ref);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { ref } = action.payload;
      const index = state.findIndex(e => e.ref === ref);
      state.splice(index, 1);
    },
    clean: (state, action) => [],
  },
});

export const { add, edit, remove, clean, change } = economySlice.actions;
export default economySlice.reducer;