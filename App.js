import { PersistGate } from "redux-persist/integration/react";
import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store";
import Main from "./routes/Main";
import { GoogleSignin } from "react-native-google-signin";

GoogleSignin.configure({
  androidClientId:
    "939036008047-q9jbdtk7vb7m1p8ermfhugjt4nrlorvl.apps.googleusercontent.com",
  iosClientId:
    "939036008047-m8go6arfvej2qfbv1aku6c93fhmh7bqn.apps.googleusercontent.com",
});

export default function App() {
  LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
  ]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Main />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
