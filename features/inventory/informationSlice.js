const { createSlice } = require("@reduxjs/toolkit");

export const informationSlice = createSlice({
  name: "inventory",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((i) => i.id === id);
      state[index] = data;
    },
    updateMany: (state, action) => {
      const { data } = action.payload;
      return state.map((s) => {
        const found = data.find((d) => d.id === s.id);
        if (found) return { ...s, ...found };
        return s;
      });
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((i) => i.id === id);
      state.splice(index, 1);
    },
    clean: (state, action) => (state = []),
  },
});

export const { change, add, edit, remove, updateMany, clean } = informationSlice.actions;
export default informationSlice.reducer;
