import type { Payroll } from "domain/entities/data/collaborators/payroll.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const payroll = (collection: Collection) => collection.payroll;

const initialState: Payroll[] = [];

export const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<Payroll[]>) => action.payload,
    add: (state, action: PayloadAction<Payroll>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<Payroll>) => {
      const payroll = action.payload;
      const index = state.findIndex((s) => s.id === payroll.id);
      if (index !== -1) state[index] = payroll;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => payroll(action.payload));
  },
});

export const { add, edit, remove, clean, change } = payrollSlice.actions;
export default payrollSlice.reducer;
