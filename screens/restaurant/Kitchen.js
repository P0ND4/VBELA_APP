import { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem, getFontSize } from "@helpers/libs";
import { Swipeable } from "react-native-gesture-handler";
import { editKitchen } from "@api";
import { edit } from "@features/tables/kitchenSlice";
import helperNotification from "@helpers/helperNotification";
import Information from "@components/Information";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Card = ({ item, accept, decline }) => {
  const mode = useSelector((state) => state.mode);

  const [time, setTime] = useState("00:00:00");
  const [isOpen, setOpen] = useState(false);
  const [pauseInterval, setPauseInterval] = useState(false);

  const timer = useRef();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    if (pauseInterval) clearInterval(timer.current);
    else {
      const getTime = () => {
        const startDate = new Date(item.modificationDate);
        const endDate = new Date();

        const differenceMilliseconds = endDate.getTime() - startDate.getTime();
        const seconds = Math.floor(differenceMilliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const remainingSeconds = seconds % 60;
        const remainingMinutes = minutes % 60;

        const process = (value) => ("0" + value).slice(-2);

        setTime(`${process(hours)}:${process(remainingMinutes)}:${process(remainingSeconds)}`);
      };
      getTime();
      timer.current = setInterval(() => getTime(), 1000);
    }
    return () => clearInterval(timer.current);
  }, [item, pauseInterval]);

  const Button = ({ icon, size = getFontSize(21), style = {}, onPress = () => {} }) => {
    return (
      <TouchableOpacity style={[styles.swipeIcon, style]} onPress={() => onPress({ item })}>
        <Ionicons name={icon} size={size} color={mode === "light" ? dark.main2 : light.main5} />
      </TouchableOpacity>
    );
  };

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {decline && (
        <Button
          style={{ backgroundColor: "red" }}
          icon={decline.icon}
          size={decline.size}
          onPress={decline.onPress}
        />
      )}
      {accept && (
        <Button
          style={{ backgroundColor: light.main2 }}
          icon={accept.icon}
          size={accept.size}
          onPress={accept.onPress}
        />
      )}
    </View>
  );

  const SwipeableValidation = ({ condition, children }) =>
    condition ? (
      <Swipeable renderRightActions={rightSwipe}>{children}</Swipeable>
    ) : (
      <View>{children}</View>
    );

  const Previews = ({ item }) => {
    const [observation, setObservation] = useState(false);

    return (
      <View>
        <View style={{ flexDirection: "row" }}>
          <TextStyle color={light.main2} style={{ marginRight: 5 }}>
            {thousandsSystem(item.quantity - item.paid)}
            <TextStyle color={textColor}>x {item.name}</TextStyle>
          </TextStyle>
          {item.observation && (
            <TouchableOpacity onPress={() => setObservation(!observation)}>
              <Ionicons
                name={observation ? "eye-off" : "eye"}
                size={getFontSize(20)}
                color={light.main2}
              />
            </TouchableOpacity>
          )}
        </View>
        {observation && (
          <TextStyle smallParagraph color={light.main2}>
            {item.observation}
          </TextStyle>
        )}
      </View>
    );
  };

  return (
    <SwipeableValidation condition={!isOpen && (decline || accept) && pauseInterval}>
      <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
        <TouchableOpacity
          onPress={() => {
            setOpen(!isOpen);
            setPauseInterval(false);
          }}
          style={styles.row}
        >
          <TextStyle color={textColor}>
            {item.title.name} <TextStyle color={light.main2}>{item.title.value}</TextStyle>
          </TextStyle>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => !isOpen && (decline || accept) && setPauseInterval(!pauseInterval)}
          >
            <Ionicons
              name={pauseInterval ? "lock-open" : "lock-closed"}
              size={getFontSize(15)}
              color={light.main2}
              style={{ marginRight: 4 }}
            />
            <TextStyle color={light.main2}>{pauseInterval ? "PAUSADO" : time}</TextStyle>
          </TouchableOpacity>
        </TouchableOpacity>
        {isOpen && (
          <View style={{ marginTop: 5 }}>
            {item.selection?.map((item) => (
              <Previews item={item} />
            ))}
          </View>
        )}
      </View>
    </SwipeableValidation>
  );
};

const Kitchen = () => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const kitchen = useSelector((state) => state.kitchen);

  const [processing, setProcessing] = useState(null);
  const [pending, setPending] = useState(null);
  const [prepared, setPrepared] = useState(null);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const filter = (status) => kitchen.filter((k) => k.status === status).reverse();
    setProcessing(filter("processing"));
    setPending(filter("pending"));
    setPrepared(filter("prepared"));
    setError(filter("error"));
  }, [kitchen]);

  const Section = ({ title, order, information, accept, decline }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
      <View style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextStyle smallSubtitle color={textColor}>
            {title}
          </TextStyle>
          <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
            <Ionicons
              name="help-circle-outline"
              size={25}
              color={light.main2}
              style={{ marginLeft: 5, marginRight: 10 }}
            />
          </TouchableOpacity>
          <View style={{ height: 1, flexGrow: 1, backgroundColor: light.main2 }} />
        </View>
        {order === null && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator color={light.main2} size="large" style={{ marginRight: 5 }} />
            <TextStyle>Cargando</TextStyle>
          </View>
        )}
        {order?.length === 0 && (
          <TextStyle smallParagraph color={light.main2}>
            NO HAY ORDENES
          </TextStyle>
        )}
        <FlatList
          data={order || []}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} accept={accept} decline={decline} />}
        />
        <Information
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          title={title.toUpperCase()}
          content={() => (
            <TextStyle smallParagraph color={textColor}>
              {information}
            </TextStyle>
          )}
        />
      </View>
    );
  };

  const changeStatus = ({ item, change }) => {
    Alert.alert(
      "EY",
      `¿Estas seguro que desea cambiar el estado a ${
        change.status === "pending"
          ? "PENDIENTE"
          : change.status === "prepared"
          ? "PREPARADO"
          : "NO PROCESADO"
      }?`,
      [
        {
          style: "cancel",
          text: "No estoy seguro",
        },
        {
          text: "Estoy seguro",
          onPress: async () => {
            const kitchen = { ...item, modificationDate: new Date(), ...change };

            dispatch(edit({ id: item.id, data: kitchen }));
            await editKitchen({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              kitchen,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
            await helperNotification(
              helperStatus,
              user,
              "Estado de orden cambiada",
              `El pedido esta ${item.title.name}:${item.title.value} esta en estatus ${
                kitchen.status === "pending"
                  ? "(pendiente)"
                  : kitchen.status === "prepared"
                  ? "(preparado)"
                  : "(no procesado)"
              }`,
              "accessToTable"
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Layout>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextStyle smallSubtitle color={textColor} style={{ marginRight: 10 }}>
          COCINA
        </TextStyle>
        <Ionicons name="bonfire-outline" color={light.main2} size={getFontSize(25)} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: SCREEN_HEIGHT / 1.3, marginTop: 15 }}
      >
        <Section
          title="Procesando"
          information="Son aquellas órdenes que están en espera para ser procesado en cocina"
          order={processing}
          accept={{
            icon: "send",
            onPress: ({ item }) => changeStatus({ item, change: { status: "pending" } }),
          }}
          decline={{
            icon: "close-circle-outline",
            onPress: ({ item }) => changeStatus({ item, change: { status: "error" } }),
          }}
        />
        <Section
          title="Pendiente"
          information="Son aquellas órdenes que han sido procesadas por cocina y se está preparando para su despacho"
          order={pending}
          accept={{
            icon: "send",
            onPress: ({ item }) => changeStatus({ item, change: { status: "prepared" } }),
          }}
          decline={{
            icon: "close-circle-outline",
            onPress: ({ item }) => changeStatus({ item, change: { status: "error" } }),
          }}
        />
        <Section
          title="Preparado"
          information="Son aquellas órdenes que se han preparado y están esperando a su despacho final"
          order={prepared}
          accept={{
            icon: "checkmark-circle-outline",
            onPress: ({ item }) => changeStatus({ item, change: { status: "finished" } }),
          }}
          decline={{
            icon: "close-circle-outline",
            onPress: ({ item }) => changeStatus({ item, change: { status: "error" } }),
          }}
        />
        <Section
          title="No procesado"
          information="No se pudo procesar la orden por un problema en cocina, el cocinero describió el problema en la orden"
          order={error}
          accept={{
            icon: "checkmark-circle-outline",
            onPress: ({ item }) => changeStatus({ item, change: { status: "finished" } }),
          }}
        />
      </ScrollView>
      {/* <Information
        modalVisible={modalVisible}
        seatModalVisible={setModalVisible}
        title="OBSERVACIÓN"
        content={() => (
          <View>
            <TextStyle smallParagraph color={textColor}>
              Agrega una observación para la justificación
            </TextStyle>
          </View>
        )}
      /> */}
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  swipeIcon: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default Kitchen;
