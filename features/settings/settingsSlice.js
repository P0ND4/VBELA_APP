const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  wifi: {
    showHome: true,
    showInHeader: false,
  },
  people: {
    hideNotDebt: false,
    hidePrice: false,
  },
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    change: (state, action) => (state = action.payload),
    clean: (state, action) => (state = initialState),
  },
});

export const { change, clean } = settingsSlice.actions;
export default settingsSlice.reducer;
