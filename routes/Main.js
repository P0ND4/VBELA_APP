import { useEffect, useRef, useState } from "react";
import { AppState, Easing } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { editUser, getRule, getUser } from "@api";
import { socket } from "@socket";
import { active, inactive, inactive as inactiveGroup } from "@features/helpers/statusSlice";
import { change as changeHelpers } from "@features/helpers/informationSlice";
import { change as changeLanguage } from "@features/settings/languageSlice";
import { change as changeMode } from "@features/settings/modeSlice";
import { change as changeSettings } from "@features/settings/settingsSlice";
import { change as changeUser } from "@features/user/informationSlice";
import {
  change as changeSynchronization,
  clean as cleanSynchronization,
} from "@features/user/synchronizationSlice";
import changeGeneralInformation from "@helpers/changeGeneralInformation";
import cleanData from "@helpers/cleanData";
import { readFile, removeFile, writeFile } from "@helpers/offline";
import NetInfo from "@react-native-community/netinfo";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import SignIn from "@screens/SignIn";
import CreateEconomy from "@screens/event/CreateEconomy";
import Event from "@screens/event/Event";
import CreateHelper from "@screens/helper/CreateHelper";
import CreateElement from "@screens/inventory/CreateElement";
import CreateEntryOutput from "@screens/inventory/CreateEntryOutput";
import CreatePerson from "@screens/people/CreatePerson";
import CreateAccommodationReserve from "@screens/reservation/accommodation/Create";
import CreateStandardReserve from "@screens/reservation/standard/Create";
import CreateZone from "@screens/reservation/zone/Create";
import ZoneInformation from "@screens/reservation/zone/Information";
import Place from "@screens/reservation/place/Place";
import CreatePlace from "@screens/reservation/place/Create";
import PlaceInformation from "@screens/reservation/place/Information";
import StandardReserveInformation from "@screens/reservation/standard/Information";
import AccommodationReserveInformation from "@screens/reservation/accommodation/Information";
import Recipe from "@screens/recipe/Recipe";
import CreateRecipe from "@screens/recipe/CreateRecipe";
import CreateSaleProduct from "@screens/salesM/CreateProduct";
import CreateOrderProduct from "@screens/restaurant/order/CreateProduct";
import CreateTable from "@screens/restaurant/CreateTable";
import EditInvoice from "@screens/sales/EditInvoice";
import Invoice from "@utils/order/screens/Invoice";
import OrderStatus from "@utils/order/screens/Complete";
import SalesPreviewOrder from "@screens/salesM/Preview";
import TableInformation from "@screens/restaurant/TableInformation";
import CreateGroup from "@screens/sales/CreateGroup";
import EmailAndPhone from "@screens/register/EmailAndPhone";
import Selection from "@screens/register/Selection";
import Verification from "@screens/register/Verification";
import ClientSupplier from "@screens/setting/ClientSupplier";
import EntryOutputInformation from "@screens/inventory/EntryOutputInformation";
import InventoryInformation from "@screens/inventory/InventoryInformation";
import History from "@screens/statistic/History";
import Wifi from "@screens/setting/Wifi";
import SupplierDebts from "@screens/people/supplier/Debts";
import SupplierInformation from "@screens/people/supplier/Information";
import CustomerDebts from "@screens/people/customer/Debts";
import CustomerInformation from "@screens/people/customer/Information";
import CustomerReservations from "@screens/people/customer/Reservations";
import CustomerSales from "@screens/people/customer/Sales";
import RestaurantPreviewOrder from "@screens/restaurant/order/Preview";
import RestaurantCreateOrder from "@screens/restaurant/order/Create";
import theme from "@theme";

import * as BackgroundFetch from "expo-background-fetch";
import * as localization from "expo-localization";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import App from "./App";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_FETCH_TASK = "Sincronizando";

const { light, dark } = theme();
const Stack = createStackNavigator();

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const data = await readFile({ name: "data.json" });
    const work = await readFile({ name: "work.json" });
    if (!data.error) {
      socket.emit("sync", { data, ...work });
      await removeFile({ name: "data.json" });
    }
    return !data.error
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

const Main = () => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helpers = useSelector((state) => state.helpers);
  const session = useSelector((state) => state.session);
  const helperStatus = useSelector((state) => state.helperStatus);
  const synchronization = useSelector((state) => state.synchronization);
  const language = useSelector((state) => state.language);

  const [connected, setConnected] = useState(false);

  const dispatch = useDispatch();
  const navigation = useRef();
  const pingRef = useRef();

  const [status, setStatus] = useState(null);

  const sendSync = async (data) => {
    const rooms = user?.helpers?.map((h) => h.id);
    socket.emit("sync", {
      data,
      room: helperStatus.id ? [helperStatus.id] : [],
      helpers: rooms,
      identifier: user?.identifier,
    });
    await removeFile({ name: "data.json" });
  };

  const checkUser = async (data) => {
    const information = await readFile({ name: "user.json" });
    const userFound = data.helpers?.find((helper) => helper.id === helperStatus.id);

    if (userFound) {
      if (userFound.user !== helperStatus.user || userFound.password !== helperStatus.password) {
        dispatch(inactive());
        if (!information.error) changeGeneralInformation(dispatch, information);
        return { error: true, type: "User or password changed" };
      } else {
        dispatch(active({ ...userFound, identifier: helperStatus.identifier }));
        return { error: false, type: null, userFound };
      }
    } else {
      dispatch(inactive());
      if (!information.error) changeGeneralInformation(dispatch, information);
      return { error: true, type: "Helper not found" };
    }
  };

  const dataNotUploadedInformation = async (res) => {
    const check = checkUser(res);
    const data = await readFile({ name: "data.json" });
    if (!data.error) {
      const file = data;

      if (!check.error) await sendSync(data);
      else {
        if (check.type === "Helper not found") {
          for (let i = 0; i < file?.length; i++) {
            if (file[i].identifier !== user?.identifier) file.splice(i, 1);
          }
          await sendSync(file);
        } else {
          for (let i = 0; i < file?.length; i++) {
            if (file[i].creationDate < check.userFound.modificationDate) file.splice(i, 1);
          }
          await sendSync(file);
        }
      }

      await helperNotification(
        helperStatus,
        user,
        `${user?.identifier} ha recuperado la conexión`,
        check.error
          ? "Algunos cambios hechos por el usuario antes del cambio fueron sincronizados"
          : "Los cambios que se hicieron fuera de línea han sido sincronizados"
      );

      return true;
    } else return false;
  };

  useEffect(() => {
    const getAppInformation = async () => {
      const routes = navigation.current.getState().routes;
      const name = routes[routes.length - 1].name;

      const res = await getRule();

      if (!res.error) {
        if (res.block) {
          if (name !== "Event") navigation.current.replace("Event", { mode: "blocked" });
          return;
        }

        const convertToNumber = (string) => {
          try {
            return parseInt(string.split(".").join(""));
          } catch (e) {
            return 0;
          }
        };

        if (convertToNumber(process.env.EXPO_PUBLIC_VERSION) < convertToNumber(res.version.detail)) {
          if (name !== "Event")
            navigation.current.replace("Event", {
              mode: "update",
              version: res.version.detail,
            });
          return;
        }

        if (name === "Event") navigation.current.replace(!session ? "SignIn" : "App");
      }
    };
    if (connected) getAppInformation();
  }, [connected]);

  useEffect(() => {
    const initializeSync = async () => {
      if (status === null) return checkStatusAsync();
      if (status === 3) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        if (connected && session) {
          if (!isRegistered) await registerBackgroundFetchAsync();
        } else if (isRegistered) await unregisterBackgroundFetchAsync();
      } else
        alert(
          "En tu dispositivo no esta disponible o no esta habilitado la sincronizacion en segundo plano"
        );
    };
    initializeSync();
  }, [status, session, connected]);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    setStatus(status);
  };

  useEffect(() => {
    const activeNotification = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };
    activeNotification();
  }, []);

  useEffect(() => {
    const sendSocket = () => {
      if (connected && session) {
        const rooms = helpers.map((h) => h.id);
        if (user && helperStatus.active) socket.emit("enter_room", { helpers: [helperStatus.id] });
        else if (user && helpers.length > 0) socket.emit("enter_room", { helpers: rooms });
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        if (connected && session) sendSocket();
      }
    };
    // Registra el oyente de cambio de estado de la aplicación
    const appStateListener = AppState.addEventListener("change", handleAppStateChange);

    if (connected && session) sendSocket();

    // Limpia el oyente al desmontar el componente
    return () => appStateListener.remove();
  }, [connected, session, helpers, helperStatus.active]);

  useEffect(() => {
    const getInformation = async () => {
      const res = await getUser({
        identifier: helperStatus.active ? helperStatus.identifier : user?.identifier,
      });
      if (!helperStatus.active) await writeFile({ name: "user.json", value: res });
      if (res.error && res?.details === "api") return;

      if (res.error && res.type === "Username does not exist" && connected) {
        if (!helperStatus.active) {
          navigation.current.replace("SignIn");
          await removeFile({ name: "data.json" });
          await removeFile({ name: "user.json" });
          return cleanData(dispatch);
        } else {
          const information = await readFile({ name: "user.json" });
          changeGeneralInformation(dispatch, information);
        }
      }

      const isChange = await dataNotUploadedInformation(res);
      if (!isChange) changeGeneralInformation(dispatch, res);

      if (!helperStatus.active && !res.error) {
        dispatch(changeUser(res));
        dispatch(changeLanguage(res?.settings?.language));
        dispatch(changeMode(res.mode));
        dispatch(changeSettings(res.settings));
        dispatch(changeHelpers(res.helpers));
      }

      const rooms = helpers.map((h) => h.id);
      await writeFile({
        name: "work.json",
        value: {
          room: helperStatus.id ? [helperStatus.id] : [],
          helpers: rooms,
          identifier: user?.identifier,
        },
      });
    };

    // Maneja el cambio de estado de la aplicación
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        if (connected && session) getInformation();
      }
    };
    // Registra el oyente de cambio de estado de la aplicación
    const appStateListener = AppState.addEventListener("change", handleAppStateChange);

    if (connected && session) getInformation();

    // Limpia el oyente al desmontar el componente
    return () => appStateListener.remove();
  }, [connected, session, helperStatus.active]);

  useEffect(() => {
    socket.on("connect", () => {
      dispatch(
        changeSynchronization({
          ...synchronization,
          connected: true,
          ping: 100,
        })
      );
    });

    socket.on("disconnect", () => {
      dispatch(cleanSynchronization());
    });
  }, []);

  useEffect(() => {
    const rooms = helpers.map((h) => h.id);
    if (connected && session && (rooms.length > 0 || helperStatus.active) && synchronization.connected) {
      let pingSend = false;
      const interval = setInterval(() => {
        if (!pingSend) {
          socket.emit("ping");
          pingRef.current = new Date().getTime();
          pingSend = true;
        }
      }, 3000);

      socket.on("pong", (rooms) => {
        const endTime = new Date().getTime();
        const duration = endTime - pingRef.current;
        pingSend = false;
        dispatch(
          changeSynchronization({
            connected: true,
            ping: duration,
            lastConnection: new Date().getTime(),
            rooms,
          })
        );
      });
      return () => clearInterval(interval);
    }
  }, [connected, session, helpers, helperStatus.active, synchronization.connected]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected !== connected) {
        setConnected(state.isConnected);
      }
    });

    return () => unsubscribe();
  });

  useEffect(() => {
    const leave = async (g) => {
      socket.emit("leave", { helpers: g });
      const rooms = helpers.map((h) => h.id);
      if (rooms.length > 0) socket.emit("enter_room", { helpers: rooms });
      changeGeneralInformation(dispatch, user);
      dispatch(inactiveGroup());
    };
    socket.on("close_room", leave);
    return () => socket.off("close_room", leave);
  }, [helpers]);

  useEffect(() => {
    const change = ({ data, confidential }) => {
      if (confidential && !helperStatus.active) {
        dispatch(changeUser(data));
        dispatch(changeHelpers(data.helpers));
      }
      if (helperStatus.active) {
        const user = checkUser(data);
        if (user.error) return;
      }
      changeGeneralInformation(dispatch, data);
    };

    socket.on("change", change);
    return () => socket.off("change", change);
  }, [helperStatus]);

  useEffect(() => {
    (async () => {
      const foundLanguage = localization.getLocales()[0].languageCode;
      const available = [
        "ar",
        "bn",
        "de",
        "en",
        "es",
        "fr",
        "hi",
        "it",
        "ja",
        "ko",
        "pt",
        "ru",
        "sw",
        "tr",
        "zh",
      ];

      const lang = available.includes(foundLanguage) ? foundLanguage : "en";
      if (!language) dispatch(changeLanguage(lang));
      if (user?.settings?.language || !user) return;
      const settings = {
        ...user.settings,
        language: lang,
      };
      dispatch(changeSettings(settings));
      await editUser({ identifier: user.identifier, change: { settings } });
    })();
  }, [user?.settings]);

  const config = {
    animation: "spring",
    config: {
      stiffness: 1000,
      damping: 50,
      mass: 3,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  const closeConfig = {
    animation: "timing",
    config: {
      duration: 200,
      easing: Easing.linear,
    },
  };

  return (
    <Stack.Navigator
      initialRouteName={!session ? "SignIn" : "App"}
      screenOptions={({ navigation: nav }) => {
        navigation.current = nav;

        return {
          headerTintColor: mode === "dark" ? dark.main4 : light.textDark,
          headerStyle: {
            backgroundColor: mode === "dark" ? dark.main1 : "#FFFFFF",
          },
          transitionSpec: {
            open: config,
            close: closeConfig,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerMode: "float",
        };
      }}
    >
      <Stack.Group>
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
        <Stack.Screen name="EmailAndPhone" component={EmailAndPhone} />
        <Stack.Screen
          name="Verification"
          component={Verification}
          options={{ title: "Código de verificación" }}
        />
        <Stack.Screen
          name="Selection"
          component={Selection}
          options={{
            title: "Selecciona el tipo de cuenta",
            gestureEnabled: false,
          }}
        />
      </Stack.Group>
      <Stack.Screen name="App" component={App} options={{ headerShown: false }} />
      <Stack.Group>
        <Stack.Group>
          <Stack.Screen name="Wifi" component={Wifi} options={{ title: "WIFI" }} />
          <Stack.Screen
            name="ClientSupplier"
            component={ClientSupplier}
            options={{ title: "Cliente y proveedor" }}
          />
        </Stack.Group>
        <Stack.Screen name="Place" component={Place} />
        <Stack.Screen name="PlaceInformation" component={PlaceInformation} />
        <Stack.Screen
          name="CreatePlace"
          component={CreatePlace}
          options={{ title: "Creación de nomenclatura" }}
        />
        <Stack.Screen name="CreateZone" component={CreateZone} options={{ title: "Creación de zona" }} />
        <Stack.Screen name="ZoneInformation" component={ZoneInformation} />
        <Stack.Screen
          name="CreateAccommodationReserve"
          component={CreateAccommodationReserve}
          options={{ title: "Reservar: Acomodación" }}
        />
        <Stack.Screen
          name="CreateStandardReserve"
          component={CreateStandardReserve}
          options={{ title: "Reservar: Estandar" }}
        />
        <Stack.Screen
          name="StandardReserveInformation"
          component={StandardReserveInformation}
          options={{ title: "Infomación: Estandar" }}
        />
        <Stack.Screen
          name="AccommodationReserveInformation"
          component={AccommodationReserveInformation}
          options={{ title: "Infomación: Acomodación" }}
        />
        <Stack.Screen
          name="CreateHelper"
          component={CreateHelper}
          options={{ title: "Creación de grupo" }}
        />
        <Stack.Screen name="CreateTable" component={CreateTable} options={{ title: "Crear mesa" }} />
        <Stack.Screen name="TableInformation" component={TableInformation} />
        <Stack.Screen name="CreateEconomy" component={CreateEconomy} />

        <Stack.Screen name="Recipe" component={Recipe} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipe} />

        <Stack.Screen
          name="CreateSaleProduct"
          component={CreateSaleProduct}
          options={{ title: "Crear producto de venta" }}
        />
        <Stack.Screen
          name="CreateOrderProduct"
          component={CreateOrderProduct}
          options={{ title: "Crear producto/pedidos" }}
        />

        <Stack.Group>
          <Stack.Screen
            name="RestaurantPreviewOrder"
            component={RestaurantPreviewOrder}
            options={{ title: "Carrito" }}
          />
          <Stack.Screen
            name="RestaurantCreateOrder"
            component={RestaurantCreateOrder}
            options={{ title: "Vender" }}
          />
        </Stack.Group>
        <Stack.Group>
          <Stack.Screen
            name="SalesPreviewOrder"
            component={SalesPreviewOrder}
            options={{ title: "Carrito" }}
          />
        </Stack.Group>

        <Stack.Screen name="OrderStatus" component={OrderStatus} options={{ headerShown: false }} />
        <Stack.Screen name="Invoice" component={Invoice} options={{ headerShown: false }} />
        <Stack.Screen
          name="EditInvoice"
          component={EditInvoice}
          options={{ title: "Configurar mi recibo" }}
        />
        <Stack.Screen name="CreatePerson" component={CreatePerson} />
        <Stack.Screen name="CreateElement" component={CreateElement} />
        <Stack.Screen name="CreateEntryOutput" component={CreateEntryOutput} />
        <Stack.Screen name="EntryOutputInformation" component={EntryOutputInformation} />
        <Stack.Screen
          name="InventoryInformation"
          component={InventoryInformation}
          options={{ title: "Información de inventario" }}
        />
        <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ title: "Crear grupo" }} />
        <Stack.Screen name="History" component={History} options={{ title: "Historial" }} />
        <Stack.Group>
          <Stack.Screen
            name="CustomerDebts"
            component={CustomerDebts}
            options={{ title: "Deudas: Clientes" }}
          />
          <Stack.Screen
            name="CustomerInformation"
            component={CustomerInformation}
            options={{ title: "Información: Clientes" }}
          />
          <Stack.Screen
            name="CustomerReservations"
            component={CustomerReservations}
            options={{ title: "Reservaciones: Clientes" }}
          />
          <Stack.Screen
            name="CustomerSales"
            component={CustomerSales}
            options={{ title: "Ventas: Clientes" }}
          />
        </Stack.Group>
        <Stack.Group>
          <Stack.Screen
            name="SupplierDebts"
            component={SupplierDebts}
            options={{ title: "Deudas: Proveedores" }}
          />
          <Stack.Screen
            name="SupplierInformation"
            component={SupplierInformation}
            options={{ title: "Información: Proveedores" }}
          />
        </Stack.Group>
      </Stack.Group>
      <Stack.Screen name="Event" component={Event} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default Main;
