const { createSlice } = require("@reduxjs/toolkit");

export const invoicesSlice = createSlice({
  name: "invoices",
  initialState: [],
  reducers: {
    change: (state, action) => action.payload,
    add: (state, action) => [...state, action.payload],
    edit: (state, action) => {
      const { data } = action.payload;
      return state.map((s) => (s.id === data.id ? data : s));
    },
    remove: (state, action) => {
      const { id } = action.payload;
      return state.filter((r) => r.id !== id);
    },
    clean: (state, action) => [],
  },
});

export const { add, edit, remove, clean, change } = invoicesSlice.actions;
export default invoicesSlice.reducer;
