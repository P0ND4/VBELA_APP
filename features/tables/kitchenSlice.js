const { createSlice } = require("@reduxjs/toolkit");

export const kitchenSlice = createSlice({
  name: "kitchen",
  initialState: [],
  reducers: {
    change: (state, action) => state = action.payload,
    add: (state, action) => void (state = state.push(action.payload)),
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((k) => k.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ref } = action.payload;
      const kitchen = state.filter((k) => k.ref === ref);
      for (let k of kitchen) {
        const index = state.findIndex((kit) => kit.ref === k.ref && kit.finished === false);
        state.splice(index, 1);
      };
    },
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((k) => k.id === id);
      state[index] = { ...state[index], ...data };
    },
    clean: (state, action) => (state = []),
  },
});

export const { clean, change, add, edit, remove, removeMany } = kitchenSlice.actions;
export default kitchenSlice.reducer;
