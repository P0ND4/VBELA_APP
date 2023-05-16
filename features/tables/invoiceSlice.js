const { createSlice } = require("@reduxjs/toolkit");

export const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {},
  reducers: {
    change: (state, action) => (state = action.payload),
    clean: (state, action) => (state = {}),
  },
});

export const { clean, change } = invoiceSlice.actions;
export default invoiceSlice.reducer;
