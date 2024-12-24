import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "application/store";
import { Status } from "domain/enums/data/element/status.enums";

export const selectPendingOrders = createSelector(
  (state: RootState) => state.orders,
  (orders) => orders.filter((o) => ![Status.Completed, Status.Canceled].includes(o.status)),
);
