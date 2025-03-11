import type { PaymentMethods } from "domain/entities/data/settings/payment.methods.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const paymentMethods = (collection: Collection) => collection.paymentMethods;

const initialState: PaymentMethods[] = [];

export const paymentMethodsSlice = createSlice({
  name: "payment-methods",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<PaymentMethods[]>) => action.payload,
    add: (state, action: PayloadAction<PaymentMethods>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<PaymentMethods>) => {
      const method = action.payload;
      const index = state.findIndex((m) => m.id === method.id);
      if (index !== -1) state[index] = method;
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((m) => m.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => paymentMethods(action.payload));
  },
});

export const { add, edit, remove, clean, change } = paymentMethodsSlice.actions;
export default paymentMethodsSlice.reducer;
