const { createSlice } = require('@reduxjs/toolkit');

export const nomenclaturesSlice = createSlice({
  name: 'nomenclatures',
  initialState: [],
  reducers: {
    change: (state, action) => state = action.payload,
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((r) => r.id === id);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex(n => n.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ref } = action.payload;
      const newNomenclatures = state.filter((r) => r.ref === ref);
      for (let n of newNomenclatures) {
        const index = state.findIndex((curr) => curr.id === n.id);
        state.splice(index, 1);
      }
    },
    clean: (state, action) => (state = []),
  }
});

export const { add, change, clean, remove, removeMany, edit } = nomenclaturesSlice.actions;
export default nomenclaturesSlice.reducer;