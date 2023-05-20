import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import { active, inactive } from "../features/function/informationSlice";
import { change as changeHelpers } from "../features/helpers/informationSlice";
import { change as changeUser } from "../features/user/informationSlice";
import { socket } from "../socket";
import { getRule, getUser } from "../api";
import { readFile, removeFile, writeFile } from "../helpers/offline";
import NetInfo from "@react-native-community/netinfo";
import SignIn from "../screens/SignInScreen";
import Home from "../screens/HomeScreen";
import Statistic from "../screens/StatisticScreen";
import Place from "../screens/PlaceScreen";
import CreatePlace from "../screens/CreatePlaceScreen";
import CreateReserve from "../screens/CreateReserveScreen";
import ReserveInformation from "../screens/ReserveInformationScreen";
import theme from "../theme";
import PlaceInformation from "../screens/PlaceInformationScreen";
import CreateZoneScreen from "../screens/CreateZoneScreen";
import Helper from "../screens/HelperScreen";
import CreateHelper from "../screens/CreateHelperScreen";
import Tables from "../screens/TablesScreen";
import CreateTable from "../screens/CreateTableScreen";
import TableInformation from "../screens/TableInformationScreen";
import changeGeneralInformation from "../helpers/changeGeneralInformation";
import CreateEconomy from "../screens/CreateEconomyScreen";
import CreateProduct from "../screens/CreateProductScreen";
import version from "../version.json";
import Event from "../screens/EventScreen";
import CreateOrder from "../screens/CreateOrderScreen";
import PreviewOrder from "../screens/PreviewOrderScreen";
import OrderCompletion from "../screens/OrderCompletionScreen";
import cleanData from "../helpers/cleanData";
import CreatePercentage from "../screens/CreatePercentageScreen";
import EditOrder from "../screens/EditOrderScreen";
import Invoice from "../screens/InvoiceScreen";
import InvoiceByEmail from "../screens/InvoiceByEmailScreen";
import EditInvoice from "../screens/EditInvoiceScreen";
import Kitchen from "../screens/KitchenScreen";
import CreateRoster from "../screens/CreateRosterScreen";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_FETCH_TASK = "Sincronizando";

const light = theme.colors.light;
const dark = theme.colors.dark;

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
  const session = useSelector((state) => state.session);
  const activeGroup = useSelector((state) => state.activeGroup);

  const [connected, setConnected] = useState(false);

  const dispatch = useDispatch();
  const navigation = useRef();

  const [status, setStatus] = useState(null);

  const sendSync = async (data) => {
    const groups = user?.helpers?.map((h) => h.id);
    socket.emit("sync", {
      data,
      groups: activeGroup.id ? [activeGroup.id] : [],
      helpers: groups,
      email: user?.email,
    });
    await removeFile({ name: "data.json" });
  };

  const checkUser = async (data) => {
    const information = await readFile({ name: "user.json" });
    const userFound = data.helpers?.find(
      (helper) => helper.id === activeGroup.id
    );

    if (userFound) {
      if (
        userFound.user !== activeGroup.user ||
        userFound.password !== activeGroup.password
      ) {
        dispatch(inactive());
        if (!information.error) changeGeneralInformation(dispatch, information);
        return { error: true, type: "User or password changed" };
      } else {
        dispatch(active({ ...userFound, email: activeGroup.email }));
        return { error: false, type: null, userFound };
      }
    } else {
      dispatch(inactive());
      if (!information.error) changeGeneralInformation(dispatch, information);
      return { error: true, type: "Helper not found" };
    }
  };

  const dataNotUploadedInformation = async (res) => {
    const data = await readFile({ name: "data.json" });
    if (!data.error) {
      const check = checkUser(res);
      const file = data;

      if (!check.error) await sendSync(data);
      else {
        if (check.type === "Helper not found") {
          for (let i = 0; i < file?.length; i++) {
            if (file[i].email !== user?.email) file.splice(i, 1);
          }
          await sendSync(file);
        } else {
          for (let i = 0; i < file?.length; i++) {
            if (file[i].creationDate < check.userFound.modificationDate)
              file.splice(i, 1);
          }
          await sendSync(file);
        }
      }

      await helperNotification(
        activeGroup,
        user,
        `${user?.email} ha recuperado la conexión`,
        check.error
          ? "Algunos cambios hechos por el usuario antes del cambio fueron sincronizados"
          : "Los cambios que se hicieron fuera de línea han sido sincronizados"
      );

      const userChanged = await getUser({
        email: activeGroup.active ? activeGroup.email : user?.email,
      });

      if (!activeGroup.active) {
        dispatch(changeUser(userChanged));
        dispatch(changeHelpers(userChanged.helpers));
      }

      changeGeneralInformation(dispatch, userChanged);
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
          if (name !== "Event")
            navigation.current.replace("Event", { mode: "blocked" });
          return;
        }

        const convertToNumber = (string) => {
          try {
            parseInt(string.split(".").join(""));
          } catch (e) {
            return 0;
          }
        };

        if (
          convertToNumber(version.detail) < convertToNumber(res.version.detail)
        ) {
          if (name !== "Event")
            navigation.current.replace("Event", {
              mode: "update",
              version: res.version.detail,
            });
          return;
        }

        if (name === "Event")
          navigation.current.replace(!session ? "SignIn" : "Home");
      }
    };
    getAppInformation();
  }, [connected]);

  useEffect(() => {
    const initializeSync = async () => {
      if (status === null) return checkStatusAsync();
      if (status === 3) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
          BACKGROUND_FETCH_TASK
        );
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
    const getInformation = async () => {
      const groups = user?.helpers?.map((h) => h.id);
      if (user && activeGroup.active)
        socket.emit("connected", { groups: [activeGroup.id] });
      else if (user && user?.helpers?.length > 0)
        socket.emit("connected", { groups });
      await writeFile({
        name: "work.json",
        value: {
          groups: activeGroup.id ? [activeGroup.id] : [],
          helpers: groups,
          email: user?.email,
        },
      });

      const res = await getUser({
        email: activeGroup.active ? activeGroup.email : user?.email,
      });

      if (res.error && res?.details === "api") return;

      if (res.error && res.type === "Username does not exist" && connected) {
        if (!activeGroup.active) {
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

      if (!activeGroup.active && !res.error) {
        dispatch(changeUser(res));
        dispatch(changeHelpers(res.helpers));
      }
    };

    if (connected && session) getInformation();
  }, [connected, session]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected !== connected) {
        setConnected(state.isConnected);
      }
    });

    return () => unsubscribe();
  });

  useEffect(() => {
    const leave = (groups) => socket.emit("leave", { groups });
    socket.on("close_room", leave);
    return () => socket.off("close_room", leave);
  }, []);

  useEffect(() => {
    const change = (information) => {
      if (activeGroup.active) {
        const user = checkUser(information);
        if (user.error) return;
      }
      changeGeneralInformation(dispatch, information);
    };

    socket.on("change", change);
    return () => socket.off("change", change);
  }, [activeGroup]);

  return (
    <Stack.Navigator
      initialRouteName={!session ? "SignIn" : "Home"}
      screenOptions={({ navigation: nav }) => {
        navigation.current = nav;

        return {
          headerTintColor: mode === "dark" ? dark.main4 : light.textDark,
          headerStyle: {
            backgroundColor: mode === "dark" ? dark.main1 : "#FFFFFF",
          },
        };
      }}
    >
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Statistic"
          component={Statistic}
          options={{ title: "Estadísticas" }}
        />
        <Stack.Screen name="Place" component={Place} />
        <Stack.Screen name="PlaceInformation" component={PlaceInformation} />
        <Stack.Screen
          name="CreatePlace"
          component={CreatePlace}
          options={{ title: "Creación de nomenclatura" }}
        />
        <Stack.Screen
          name="CreateZone"
          component={CreateZoneScreen}
          options={{ title: "Creación de zona" }}
        />
        <Stack.Screen
          name="CreateReserve"
          component={CreateReserve}
          options={{ title: "Reservar" }}
        />
        <Stack.Screen
          name="ReserveInformation"
          component={ReserveInformation}
        />
        <Stack.Screen
          name="Helper"
          component={Helper}
          options={{ title: "Grupos" }}
        />
        <Stack.Screen
          name="CreateHelper"
          component={CreateHelper}
          options={{ title: "Creación de grupo" }}
        />
        <Stack.Screen
          name="Tables"
          component={Tables}
          options={{ title: "Ventas" }}
        />
        <Stack.Screen
          name="CreateTable"
          component={CreateTable}
          options={{ title: "Crear mesa" }}
        />
        <Stack.Screen name="TableInformation" component={TableInformation} />
        <Stack.Screen name="CreateEconomy" component={CreateEconomy} />
        <Stack.Screen
          name="CreateOrder"
          component={CreateOrder}
          options={{ title: "Vender" }}
        />
        <Stack.Screen
          name="CreateProduct"
          component={CreateProduct}
          options={{ title: "Nuevo producto" }}
        />
        <Stack.Screen
          name="PreviewOrder"
          component={PreviewOrder}
          options={{ title: "Carrito" }}
        />
        <Stack.Screen
          name="OrderCompletion"
          component={OrderCompletion}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreatePercentage"
          component={CreatePercentage}
          options={{ title: "Crear descuento" }}
        />
        <Stack.Screen name="EditOrder" component={EditOrder} />
        <Stack.Screen
          name="Invoice"
          component={Invoice}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InvoiceByEmail"
          component={InvoiceByEmail}
          options={{ title: "Enviar por Email" }}
        />
        <Stack.Screen
          name="EditInvoice"
          component={EditInvoice}
          options={{ title: "Configurar mi recibo" }}
        />
        <Stack.Screen
          name="Kitchen"
          component={Kitchen}
          options={{ title: "Cocina" }}
        />
        <Stack.Screen
          name="CreateRoster"
          component={CreateRoster}
          options={{ title: "Nómina" }}
        />
      </Stack.Group>
      <Stack.Screen
        name="Event"
        component={Event}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default Main;
