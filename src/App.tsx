import "./config/calendar/locales";

import React from "react";
import { registerRootComponent } from "expo";
import { LogBox } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Buffer } from "buffer";
import { store, persistor } from "./application/store";
import { NavigationContainer } from "@react-navigation/native";
import { WebSocketProvider } from "infrastructure/context/SocketContext";
import { useAppSelector } from "application/store/hook";
import appTheme from "config/theme/app.theme";
import Main from "./presentation/navigations/Main";

global.Buffer = global.Buffer || Buffer;

const Navigation: React.FC = () => {
  const darkMode = useAppSelector((state) => state.darkMode);
  const color = useAppSelector((state) => state.color);

  return (
    <NavigationContainer theme={appTheme({ color, darkMode })}>
      <Main />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  LogBox.ignoreAllLogs();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WebSocketProvider>
          <Navigation />
        </WebSocketProvider>
      </PersistGate>
    </Provider>
  );
};

registerRootComponent(App);
