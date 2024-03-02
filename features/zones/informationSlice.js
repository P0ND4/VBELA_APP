const { createSlice } = require("@reduxjs/toolkit");

export const informationSlice = createSlice({
  name: "zones",
  initialState: [],
  reducers: {
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex(z => z.id === id);
      state[index] = { ...state[index], ...data };
    },
    change: (state, action) => (state = action.payload),
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex(n => n.id === id);
      state.splice(index, 1);
    },
    clean: (state, action) => (state = []),
  },
});

export const { change, add, remove, clean, edit } = informationSlice.actions;
export default informationSlice.reducer;
