import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "application/store";
import { Status } from "domain/enums/data/element/status.enums";

export const selectPendingSales = createSelector(
  (state: RootState) => state.sales,
  (sales) => sales.filter((s) => ![Status.Completed, Status.Canceled].includes(s.status)),
);

export const selectCompletedSales = createSelector(
  (state: RootState) => state.sales,
  (sales) => sales.filter((s) => Status.Completed === s.status),
);

export const selectCanceledSales = createSelector(
  (state: RootState) => state.sales,
  (sales) => sales.filter((s) => Status.Canceled === s.status),
);
