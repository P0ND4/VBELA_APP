const { createSlice } = require('@reduxjs/toolkit');

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: [],
  reducers: {
    add: (state, action) => void (state = state.push(action.payload)),
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((order) => order.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ref } = action.payload;
      const newOrders = state.filter((o) => o.ref === ref);
      for (let n of newOrders) {
        const index = state.findIndex((curr) => curr.id === n.id);
        state.splice(index, 1);
      }
    },
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((o) => o.id === id);
      state[index] = data;
    },
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = []
  }
});

export const { change, clean, add, remove, removeMany, edit } = ordersSlice.actions;
export default ordersSlice.reducer;