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
    updateMany: (state, action) => {
      const { data } = action.payload;
      return state.map((s) => {
        const found = data.find((d) => d.id === s.id);
        if (found) return { ...s, ...found };
        return s;
      });
    },
    remove: (state, action) => {
      const { id } = action.payload;
      return state.filter((r) => r.id !== id);
    },
    removeMany: (state, action) => {
      const { ids } = action.payload;
      return state.filter((s) => !ids.includes(s.id));
    },
    removeManyByManyRefs: (state, action) => {
      const refs = action.payload.refs;
      return state.filter((r) => !refs.includes(r.ref));
    },
    clean: (state, action) => (state = []),
  },
});

export const { add, change, remove, edit, clean, removeMany, removeManyByManyRefs, updateMany } =
  standardReservationsSlice.actions;
export default standardReservationsSlice.reducer;
