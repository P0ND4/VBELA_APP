const { createSlice } = require("@reduxjs/toolkit");

export const standardReservationsSlice = createSlice({
  name: "standard-reservations",
  initialState: [],
  reducers: {
    change: (state, action) => action.payload,
    add: (state, action) => [...state, action.payload],
    edit: (state, action) => {
      const { id, data } = action.payload;
      return state.map((s) => {
        if (s.id === id) return { ...s, ...data };
        return s;
      });
    },
    remove: (state, action) => {
      const { id } = action.payload;
      return state.filter((r) => r.id !== id);
    },
    removeMany: (state, action) => {
      const refToRemove = action.payload.ref;
      return state.filter((r) => r.ref !== refToRemove);
    },
    removeManyByManyRefs: (state, action) => {
      const refs = action.payload.refs;
      return state.filter((r) => !refs.includes(r.ref));
    },
    clean: (state, action) => (state = []),
  },
});

export const { add, change, remove, edit, clean, removeMany, removeManyByManyRefs } =
  standardReservationsSlice.actions;
export default standardReservationsSlice.reducer;
