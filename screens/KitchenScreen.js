import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, StyleSheet, Dimensions, ScrollView, Alert } from "react-native";
import { editKitchen, removeKitchen, getUser } from "../api";
import { thousandsSystem } from "../helpers/libs";
import {
  edit as editK,
  remove as removeK,
} from "../features/tables/kitchenSlice";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import theme from "../theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const KitchenScreen = () => {
  const kitchen = useSelector((state) => state.kitchen);
  const mode = useSelector((state) => state.mode);
  const activeGroup = useSelector((state) => state.activeGroup);
  const user = useSelector((state) => state.user);

  const [orders, setOrders] = useState([]);
  const [ordersFinished, setOrdersFinished] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    setOrders(kitchen.filter((k) => k.finished === false));
    setOrdersFinished(kitchen.filter((k) => k.finished));
  }, [kitchen]);

  const Main = ({ order, type }) => {
    const [visualize, setVisualize] = useState(false);
    const [minutes, setMinutes] = useState();
    const [seconds, setSeconds] = useState();

    const chronometerRef = useRef();

    const difference = () => {
      const creationDate = new Date(
        type === "kitchen" ? order.creationDate : order.modificationDate
      );
      const date = new Date();

      let time = date - creationDate;
      var sec = 1000;
      var mis = sec * 60;

      var minutes = ("0" + Math.floor(time / mis)).slice(-2);

      time = time - minutes * mis;
      var seconds = ("0" + Math.floor(time / sec)).slice(-2);

      setSeconds(seconds);
      setMinutes(minutes);
    };

    useEffect(() => {
      clearInterval(chronometerRef.current);
      difference();
      chronometerRef.current = setInterval(() => difference(), 1000);
    }, []);

    const finished = ({ id }) => {
      Alert.alert(
        "Finalización",
        "¿Estás seguro de haber terminado el pedido?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Si",
            onPress: () => {
              const kit = kitchen.find((k) => k.id === id);
              kit.finished = true;
              kit.modificationDate = new Date();

              dispatch(editK({ id, data: kit }));
              editKitchen({
                email: activeGroup.active ? activeGroup.email : user.email,
                kitchen: kit,
                groups: activeGroup.active
                  ? [activeGroup.id]
                  : user.helpers.map((h) => h.id),
              });
            },
          },
        ]
      );
    };

    const received = ({ id }) => {
      Alert.alert("Retirado", "¿Has retirado el pedido?", [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: () => {
            dispatch(removeK({ id }));
            removeKitchen({
              email: activeGroup.active ? activeGroup.email : user.email,
              id,
              groups: activeGroup.active
                ? [activeGroup.id]
                : user.helpers.map((h) => h.id),
            });
          },
        },
      ]);
    };

    const sendNotificationToKitchen = async () => {
      const title = "Pedido finalizado";
      const body = `El pedido esta en espera de retiro en ${
        order.reservation ? order.reservation : `la mesa`
      } ${order.table}`;
  
      const organizer = async (user, extra) => {
        const helpers = user.helpers.filter((helper) => helper.accessToTable);
        const expoID = [];
        if (extra) expoID.push(extra);
        for (let helper of helpers) {
          expoID.push(...helper.expoID);
        }
        const unique = expoID.filter((id, index) => expoID.indexOf(id) === index);
        const devices = unique.filter((expoID) => expoID !== user.expoID);
  
        if (devices.length !== 0) {
          await sendNotification({ title, body, array: devices });
        }
      };
  
      if (activeGroup.active) {
        const u = await getUser({ email: activeGroup.email });
        organizer(u, u.expoID);
      } else await organizer(user);
    };

    return (
      <>
        <View style={{ marginVertical: 5 }}>
          <View style={styles.card}>
            <View style={[styles.center, styles.chronometer]}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {minutes}:{seconds}
              </TextStyle>
            </View>
            <ButtonStyle
              onPress={() => setVisualize(!visualize)}
              style={{ width: SCREEN_WIDTH / 2.3, margin: 0 }}
              backgroundColor={mode === "light" ? light.main5 : dark.main2}
            >
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {order.reservation ? order.reservation : "Mesa"} {order.table}
              </TextStyle>
            </ButtonStyle>
            <ButtonStyle
              style={{ width: SCREEN_WIDTH / 4, margin: 0 }}
              onPress={() => {
                if (type === "kitchen") {
                  finished({ id: order.id });
                  sendNotificationToKitchen();
                } else received({ id: order.id });
              }}
              backgroundColor={light.main2}
            >
              <TextStyle>
                {type === "kitchen" ? "Enviar" : "Recibido"}
              </TextStyle>
            </ButtonStyle>
          </View>
        </View>
        <View
          style={[
            {
              backgroundColor: mode === "light" ? light.main5 : dark.main2,
              display: visualize ? "flex" : "none",
            },
            styles.information,
          ]}
        >
          {order.selection.map((item) => (
            <TextStyle
              key={item.id}
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              <TextStyle color={light.main2} paragrahp>
                {thousandsSystem(item.count)}
              </TextStyle>
              x {item.name}
            </TextStyle>
          ))}
        </View>
      </>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {orders?.length === 0 && ordersFinished?.length === 0 && (
        <TextStyle
          center
          subtitle
          customStyle={{ marginTop: 10 }}
          color={light.main2}
        >
          No hay pedidos
        </TextStyle>
      )}
      {orders.length > 0 &&
        (!activeGroup.active || activeGroup.accessToKitchen) && (
          <View>
            <TextStyle
              smallSubtitle
              customStyle={{ marginVertical: 10 }}
              color={light.main2}
            >
              En cocina
            </TextStyle>
            <ScrollView showsVerticalScrollIndicator={false}>
              {orders?.map((order) => {
                return <Main order={order} key={order.id} type="kitchen" />;
              })}
            </ScrollView>
          </View>
        )}
      {ordersFinished.length > 0 &&
        (!activeGroup.active || activeGroup.accessToTable) && (
          <View>
            <TextStyle
              smallSubtitle
              customStyle={{ marginVertical: 10 }}
              color={light.main2}
            >
              Ordenes finalizado
            </TextStyle>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ordersFinished?.map((order) => {
                return <Main order={order} key={order.id} type="finished" />;
              })}
            </ScrollView>
          </View>
        )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  chronometer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: light.main2,
  },
  information: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export default KitchenScreen;
