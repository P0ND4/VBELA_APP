const { createSlice } = require("@reduxjs/toolkit");

export const informationSlice = createSlice({
  name: "helpers",
  initialState: [],
  reducers: {
    push: (state, action) => void (state = state.push(action.payload)),
    remove: (state, action) => {
      const { id } = action.payload;

      const index = state.findIndex((state) => state.id === id);
      state.splice(index, 1);
    },
    editData: (state, action) => {
      const { id, data } = action.payload;
      const index = state.findIndex((state) => state.id === id);
      state[index] = data;
    },
    change: (state, action) => (state = action.payload),
    clean: (state, action) => (state = []),
  },
});

export const { change, clean, push, remove, editData } =
  informationSlice.actions;
export default informationSlice.reducer;
