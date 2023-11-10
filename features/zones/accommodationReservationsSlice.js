const { createSlice } = require("@reduxjs/toolkit");

export const accommodationReservationsSlice = createSlice({
  name: "accommodation-reservations",
  initialState: [],
  reducers: {
    change: (state, action) => (state = action.payload),
    add: (state, action) => void (state = state.push(action.payload)),
    edit: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((r) => r.id === id);
      state[index] = { ...state[index], ...data };
    },
    remove: (state, action) => {
      const { id } = action.payload;
      const index = state.findIndex((r) => r.id === id);
      state.splice(index, 1);
    },
    removeMany: (state, action) => {
      const { ref } = action.payload;
      const newReservations = state.filter((r) => r.ref === ref);
      for (let r of newReservations) {
        const index = state.findIndex((curr) => curr.ref === r.ref);
        state.splice(index, 1);
      }
    },
    removeManyByOwner: (state, action) => {
      const { owner } = action.payload;

      state.forEach((reservation, index) => {;
        if (reservation.owner === owner) state.splice(index, 1);
      });
    },
    clean: (state, action) => (state = []),
  },
});

export const {
  add,
  change,
  remove,
  edit,
  clean,
  removeMany,
  removeManyByOwner,
} = accommodationReservationsSlice.actions;
export default accommodationReservationsSlice.reducer;
