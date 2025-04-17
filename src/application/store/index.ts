import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import rootReducers from "./root.reducers";

interface Persist {
  key: string;
  version?: number | undefined;
  storage: typeof ExpoFileSystemStorage;
  timeout?: number | undefined;
  whitelist?: string[] | undefined;
  blacklist?: string[] | undefined;
}

const persistConfig: Persist = {
  key: "root",
  storage: ExpoFileSystemStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
