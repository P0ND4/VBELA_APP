import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "application/store";
import { Status } from "domain/enums/data/kitchen/status.enums";

const pending = [Status.Requested, Status.Processing, Status.Confirmed];

export const selectRequestedOrder = createSelector(
  (state: RootState) => state.kitchens,
  (kitchen) => kitchen.filter((k) => k.status === Status.Requested),
);

export const selectProcessingOrder = createSelector(
  (state: RootState) => state.kitchens,
  (kitchen) => kitchen.filter((k) => k.status === Status.Processing),
);

export const selectConfirmedOrder = createSelector(
  (state: RootState) => state.kitchens,
  (kitchen) => kitchen.filter((k) => k.status === Status.Confirmed),
);

export const selectPendingKitchen = createSelector(
  (state: RootState) => state.kitchens,
  (kitchen) => kitchen.filter((k) => pending.includes(k.status)),
);

export const selectCompletedKitchen = createSelector(
  (state: RootState) => state.kitchens,
  (kitchen) => kitchen.filter((k) => k.status === Status.Completed),
);
