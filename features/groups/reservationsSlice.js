const { createSlice } = require("@reduxjs/toolkit");

export const reservationsSlice = createSlice({
  name: "reservations",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { ref, data } = action.payload;
      const index = state.findIndex((r) => r.ref === ref);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { ref } = action.payload;
      const index = state.findIndex((r) => r.ref === ref);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ref } = action.payload;
      const newReservations = state.filter((r) => r.id === ref);
      for (let r of newReservations) {
        const index = state.findIndex((curr) => curr.ref === r.ref);
        state.splice(index, 1);
      }
    },
    removeManyByOwner: (state, action) => {
      const { owner } = action.payload;
      const reservations = state.filter((r) => r.owner === owner);
      for (let r of reservations) {
        const index = state.findIndex((curr) => curr.owner === r.owner);
        state.splice(index, 1);
      }
    }, 
    clean: (state, action) => (state = []),
  },
});

export const { add, change, remove, edit, clean, removeMany, removeManyByOwner } = reservationsSlice.actions;
export default reservationsSlice.reducer;
