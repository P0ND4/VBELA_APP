import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
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
import CreateOrder from "../screens/CreateOrderScreen";
import changeGeneralInformation from "../helpers/changeGeneralInformation";
import CreateEconomy from "../screens/CreateEconomyScreen";
import { active, inactive } from "../features/function/informationSlice";
import { change as changeHelpers } from "../features/helpers/informationSlice";
import { change as changeUser } from "../features/user/informationSlice";
import { socket } from "../socket";
import { getUser } from "../api";
import { readFile, removeFile, writeFile } from "../helpers/offline";
import { changeDate } from "../helpers/libs";
import cleanData from '../helpers/cleanData';
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_FETCH_TASK = "Sincronizando";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Stack = createStackNavigator();

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const data = await readFile({ name: "data.json" });
    const work = await readFile({ name: "work.json" });
    if (data?.length > 0) {
      socket.emit("sync", { data, ...work });
      await removeFile({ name: "data.json" });
    }
    return data?.length > 0
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
    const groups = user?.helpers.map((h) => h.id);
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
        if (information) changeGeneralInformation(dispatch, information);
        return { error: true, type: "User or password changed" };
      } else {
        dispatch(active({ ...userFound, email: activeGroup.email }));
        return { error: false, type: null, userFound };
      }
    } else {
      dispatch(inactive());
      if (information) changeGeneralInformation(dispatch, information);
      return { error: true, type: "Helper not found" };
    }
  };

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
    const work = async () => {
      const groups = user?.helpers.map((h) => h.id);
      if (user && activeGroup.active)
        socket.emit("connected", { groups: [activeGroup.id] });
      else if (user && user?.helpers.length > 0)
        socket.emit("connected", { groups });
      await writeFile({
        name: "work.json",
        value: {
          groups: activeGroup.id ? [activeGroup.id] : [],
          helpers: groups,
          email: user?.email,
        },
      });
    };
    work();
  }, []);

  useEffect(() => {
    const getInformation = async () => {
      const res = await getUser({
        email: activeGroup.active ? activeGroup.email : user?.email,
      });

      if (res.error) {
        navigation.current.replace("SignIn");
        await removeFile({ name: 'data.json' });
        await removeFile({ name: 'user.json' });
        return cleanData(dispatch);
      }

      const data = await readFile({ name: "data.json" });

      if (data?.length > 0) {
        const check = checkUser(res);
        const file = data;

        if (!check.error && file?.length > 0) sendSync(data);
        if (check.error && file?.length > 0) {
          if (check.type === "Helper not found") {
            for (let i = 0; i < file.length; i++) {
              if (file[i].data.email !== user?.email) file.splice(i, 1);
            }
            sendSync(file);
          } else {
            for (let i = 0; i < file.length; i++) {
              if (file[i].creationDate < check.userFound.modificationDate)
                file.splice(i, 1);
            }
            sendSync(file);
          }
        }

        if (activeGroup.active && check.type !== "Helper not found") {
          await helperNotification(
            activeGroup,
            user,
            `${user?.email} ha recuperado la conexión`,
            `Los cambios que se hicieron fuera de línea han sido sincronizados`
          );
        } else if (check.type !== "Helper not found") {
          await helperNotification(
            activeGroup,
            user,
            `${user?.email} ha salido del grupo el día ${changeDate(
              new Date(activeGroup.disconnection)
            )}`,
            check.error
              ? "Algunos cambios hechos por el usuario antes del cambio fueron sincronizados"
              : "Los cambios hechos por el usuario han sido sincronizados"
          );
        }
      } else {
        if (!activeGroup.active) {
          dispatch(changeUser(res));
          dispatch(changeHelpers(res.helpers));
        }

        changeGeneralInformation(dispatch, res);
      }
    };

    if (connected && session) getInformation();
  }, [connected, session]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected);
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
        const user = checkUser(information.data);
        if (user.error) return;
      }
      changeGeneralInformation(dispatch, information.data);
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
          options={{ title: "Consumo" }}
        />
        <Stack.Screen
          name="CreateTable"
          component={CreateTable}
          options={{ title: "Crear mesa" }}
        />
        <Stack.Screen name="TableInformation" component={TableInformation} />
        <Stack.Screen name="CreateOrder" component={CreateOrder} />
        <Stack.Screen name="CreateEconomy" component={CreateEconomy} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default Main;
