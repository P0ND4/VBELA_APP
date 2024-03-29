const { createSlice } = require("@reduxjs/toolkit");

export const salesSlice = createSlice({
  name: "sales",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((m) => m.id === id);
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
      const index = state.findIndex((m) => m.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ids } = action.payload;
      return state.filter((s) => !ids.includes(s.id));
    },
    clean: (state, action) => (state = []),
  },
});

export const { clean, add, change, edit, remove, updateMany, removeMany } = salesSlice.actions;
export default salesSlice.reducer;
