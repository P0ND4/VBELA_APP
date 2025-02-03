import type { SaleProtocol } from "domain/entities/data/stores/sale.protocol.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const salesProtocol = (collection: Collection) => collection.salesProtocol;

const initialState: SaleProtocol[] = [];

export const salesProtocolSlice = createSlice({
  name: "sales-protocol",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<SaleProtocol[]>) => action.payload,
    add: (state, action: PayloadAction<SaleProtocol>) => {
      state.push(action.payload);
    },
    edit: (state, action: PayloadAction<SaleProtocol>) => {
      const protocol = action.payload;
      return state.map((s) => (s.id === protocol.id ? protocol : s));
    },
    remove: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      return state.filter((s) => s.id !== id);
    },
    clean: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => []);
    builder.addCase(changeAll, (_, action) => salesProtocol(action.payload));
  },
});

export const { add, edit, remove, clean, change } = salesProtocolSlice.actions;
export default salesProtocolSlice.reducer;
