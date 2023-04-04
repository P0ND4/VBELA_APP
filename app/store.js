import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import modeSlice from "../features/settings/modeSlice";
import informationUserSlice from "../features/user/informationSlice";
import informationGroupsSlice from "../features/groups/informationSlice";
import sessionSlice from "../features/user/sessionSlice";
import nomenclaturesSlice from "../features/groups/nomenclaturesSlice";
import reservationsSlice from "../features/groups/reservationsSlice";
import helpersSlice from "../features/helpers/informationSlice";
import informationJobSlice from "../features/function/informationSlice";
import informationTablesSlice from "../features/tables/informationSlice";
import ordersSlice from "../features/tables/ordersSlice";
import economySlice from "../features/function/economySlice";

const reducers = combineReducers({
  mode: modeSlice, // Mode light and dark
  user: informationUserSlice,
  groups: informationGroupsSlice,
  nomenclatures: nomenclaturesSlice,
  reservations: reservationsSlice,
  session: sessionSlice,
  helpers: helpersSlice,
  activeGroup: informationJobSlice,
  tables: informationTablesSlice,
  orders: ordersSlice,
  economy: economySlice,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage: ExpoFileSystemStorage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
