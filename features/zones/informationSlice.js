const { createSlice } = require("@reduxjs/toolkit");

export const informationSlice = createSlice({
  name: "zones",
  initialState: [],
  reducers: {
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { ref, data } = action.payload;
      const index = state.findIndex(z => z.ref === ref);
      state[index] = { ...state[index], ...data };
    },
    change: (state, action) => (state = action.payload),
    remove: (state, action) => {
      const { ref } = action.payload;
      const index = state.findIndex(n => n.ref === ref);
      state.splice(index, 1);
    },
    clean: (state, action) => (state = []),
  },
});

export const { change, add, remove, clean, edit } = informationSlice.actions;
export default informationSlice.reducer;
