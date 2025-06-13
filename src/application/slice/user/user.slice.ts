import type { User } from "domain/entities/data/user/user.entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { Collection } from "domain/entities/data/user";

const user = (collection: Partial<Collection>) => ({
  identifier: collection?.identifier ?? "",
  selected: collection?.selected ?? "",
  permissions: collection?.permissions ?? null,
});

const initialState: User = {
  identifier: "",
  selected: "",
  permissions: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<User>) => action.payload,
    clean: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => initialState);
    builder.addCase(changeAll, (_, action) => user(action.payload));
  },
});

export const { change, clean } = userSlice.actions;
export default userSlice.reducer;
