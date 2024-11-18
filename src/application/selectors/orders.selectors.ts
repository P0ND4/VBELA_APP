import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "application/store";
import { Status } from "domain/enums/data/element/status.enums";

export const selectPendingSales = createSelector(
  (state: RootState) => state.sales,
  (sales) => sales.filter((s) => s.status === Status.Pending),
);
