const { createSlice } = require("@reduxjs/toolkit");

export const ordersSlice = createSlice({
  name: "orders",
  initialState: [],
  reducers: {
    add: (state, action) => void (state = state.push(action.payload)),
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((order) => order.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ids } = action.payload;
      return state.filter((s) => !ids.includes(s.id));
    },
    removeManyByOwner: (state, action) => {
      const { ref } = action.payload;
      const orders = state.filter((o) => o.ref === ref);
      for (let o of orders) {
        const index = state.findIndex((curr) => curr.ref === o.ref);
        state.splice(index, 1);
      }
    },
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((o) => o.id === id);
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
    change: (state, action) => (state = action.payload),
    clean: (state, action) => (state = []),
  },
});

export const { change, clean, add, remove, removeMany, edit, updateMany, removeManyByOwner } =
  ordersSlice.actions;
export default ordersSlice.reducer;
