const { createSlice } = require("@reduxjs/toolkit");

export const accommodationReservationsSlice = createSlice({
  name: "accommodation-reservations",
  initialState: [],
  reducers: {
    change: (state, action) => action.payload,
    add: (state, action) => [...state, ...action.payload],
    edit: (state, action) => {
      const { data } = action.payload;
      return state.map((s) => {
        const hosted = data.find((d) => d.id === s.id);
        if (hosted) return hosted;
        return s;
      });
    },
    remove: (state, action) => {
      const { ids } = action.payload;
      return state.filter((r) => !ids.includes(r.id));
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
  accommodationReservationsSlice.actions;
export default accommodationReservationsSlice.reducer;
