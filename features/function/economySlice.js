const { createSlice } = require("@reduxjs/toolkit");

export const economySlice = createSlice({
  name: "economy",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((e) => e.id === id);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex(e => e.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ref } = action.payload;
      const economies = state.filter((e) => e.ref === ref);
      for (let e of economies) {
        const index = state.findIndex((eco) => eco.ref === e.ref);
        state.splice(index, 1);
      };
    },
    removeByEvent: (state, action) => {
      const { event } = action.payload;
      const economies = state.filter(event);
      for (let e of economies) {
        const index = state.findIndex((eco) => eco.ref === e.ref);
        state.splice(index, 1);
      };
    },
    clean: (state, action) => [],
  },
});

export const { add, edit, remove, removeMany, removeByEvent, clean, change } = economySlice.actions;
export default economySlice.reducer;