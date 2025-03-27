import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "application/store";
import { Type } from "domain/enums/data/inventory/movement.enums";

export const selectEntry = createSelector(
  (state: RootState) => state.movements,
  (movements) => movements.filter((m) => m.type === Type.Entry),
);

export const selectOutput = createSelector(
  (state: RootState) => state.movements,
  (movements) => movements.filter((m) => m.type === Type.Output),
);
