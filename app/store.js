import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import modeSlice from "@features/settings/modeSlice";
import informationUserSlice from "@features/user/informationSlice";
import informationZonesSlice from "@features/zones/informationSlice";
import sessionSlice from "@features/user/sessionSlice";
import nomenclaturesSlice from "@features/zones/nomenclaturesSlice";
import helpersSlice from "@features/helpers/informationSlice";
import helperStatusSlice from "@features/helpers/statusSlice";
import informationTablesSlice from "@features/tables/informationSlice";
import ordersSlice from "@features/tables/ordersSlice";
import economySlice from "@features/function/economySlice";
import menuSlice from "@features/tables/menuSlice";
import sectionSlice from "@features/tables/sectionSlice";
import invoiceSlice from "@features/tables/invoiceSlice";
import kitchenSlice from "@features/tables/kitchenSlice";
import rosterSlice from "@features/function/rosterSlice";
import peopleSlice from "@features/function/peopleSlice";
import synchronizationSlice from "@features/user/synchronizationSlice";
import languageSlice from "@features/settings/languageSlice";
import settingsSlice from "@features/settings/settingsSlice";
import informationInventorySlice from "@features/inventory/informationSlice";
import salesSlice from "@features/sales/salesSlice";
import productsSlice from "@features/sales/productsSlice";
import accommodationSlice from "@features/zones/accommodationsSlice";
import groupsSlice from "@features/sales/groupsSlice";

import standardReservationsSlice from "@features/zones/standardReservationsSlice";
import accommodationReservationsSlice from "@features/zones/accommodationReservationsSlice"; 

// PEOPLE //
import clientSlice from "@features/people/clientSlice";
import supplierSlice from "@features/people/supplierSlice";

const reducers = combineReducers({
  mode: modeSlice, // Mode light and dark
  user: informationUserSlice,
  zones: informationZonesSlice,
  nomenclatures: nomenclaturesSlice,
  standardReservations: standardReservationsSlice,
  accommodationReservations: accommodationReservationsSlice,
  session: sessionSlice,
  helpers: helpersSlice,
  helperStatus: helperStatusSlice,
  tables: informationTablesSlice,
  orders: ordersSlice,
  economy: economySlice,
  menu: menuSlice,
  section: sectionSlice,
  invoice: invoiceSlice,
  kitchen: kitchenSlice,
  roster: rosterSlice,
  people: peopleSlice,
  synchronization: synchronizationSlice,
  language: languageSlice,
  settings: settingsSlice,
  inventory: informationInventorySlice,
  products: productsSlice, // PRODUCTOS O SERVICIOS DE VENTAS
  sales: salesSlice, // VENTAS REALIZADAS DE SERVICIOS O VENTAS
  accommodation: accommodationSlice, // GRUPOS DE ACOMODACION DE RESERVACIONES
  groups: groupsSlice, // GRUPOS DE DE VENTAS
  // PEOPLE //
  client: clientSlice,
  supplier: supplierSlice
});

const persistConfig = {
  key: "root",
  version: 1,
  storage: ExpoFileSystemStorage,
  timeout: null,
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
