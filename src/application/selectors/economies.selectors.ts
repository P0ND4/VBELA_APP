import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "application/store";
import { Type } from "domain/enums/data/economy/economy.enums";

export const selectIncome = createSelector(
  (state: RootState) => state.economies,
  (economies) => economies.filter((e) => e.type === Type.Income),
);

export const selectEgress = createSelector(
  (state: RootState) => state.economies,
  (economies) => economies.filter((e) => e.type === Type.Egress),
);
