const { createSlice } = require("@reduxjs/toolkit");

export const billsSlice = createSlice({
  name: "bills",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => {
      //ACEPTA OBJETO COMO ARRAY COMO PARAMETROS
      const change = Array.isArray(action.payload) ? action.payload : [action.payload];
      return [...state, ...change];
    },
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((b) => b.id === id);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((b) => b.id === id);
      state.splice(index, 1);
    },
    clean: (state, action) => [],
  },
});

export const { add, edit, remove, clean, change } = billsSlice.actions;
export default billsSlice.reducer;
