import { useEffect, useState, useMemo } from "react";
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
import { thousandsSystem, formatTimeDHM } from "@helpers/libs";
import { Swipeable } from "react-native-gesture-handler";
import { edit, clean } from "@features/tables/kitchenSlice";
import { editKitchen, editUser } from "@api";
import helperNotification from "@helpers/helperNotification";
import Information from "@components/Information";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Card = ({ item, accept, decline }) => {
  const mode = useSelector((state) => state.mode);

  const [time, setTime] = useState("");
  const [isOpen, setOpen] = useState(false);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const getTimeDifference = () => {
      const startDate = new Date(item.modificationDate);
      const endDate = new Date();
      setTime(formatTimeDHM(startDate, endDate));
    };
    getTimeDifference();
    const intervalControl = setInterval(getTimeDifference, 60000);
    return () => clearInterval(intervalControl);
  }, [item]);

  const Button = ({ icon, size = 26, style = {}, onPress = () => {} }) => {
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
                size={25}
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
    <SwipeableValidation condition={!isOpen && (decline || accept)}>
      <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
        <TouchableOpacity onPress={() => setOpen(!isOpen)} style={styles.row}>
          <TextStyle color={textColor}>
            {item.title.name} <TextStyle color={light.main2}>{item.title.value}</TextStyle>
          </TextStyle>
          <TextStyle color={light.main2}>{time}</TextStyle>
        </TouchableOpacity>
        {isOpen && (
          <View style={{ marginTop: 5 }}>
            {item.selection?.map((item) => (
              <Previews item={item} />
            ))}
            {item.observation && (
              <TextStyle style={{ marginTop: 5 }} smallParagraph color={light.main2}>
                {item.observation}
              </TextStyle>
            )}
          </View>
        )}
      </View>
    </SwipeableValidation>
  );
};

const Section = ({ title, order, information, accept, decline }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

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
        initialNumToRender={4}
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

const FilterButton = ({ title, value, onPress }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <ButtonStyle
      backgroundColor={mode === "light" ? light.main5 : dark.main2}
      style={[styles.row, { width: "auto", marginHorizontal: 2, paddingHorizontal: 12 }]}
      onPress={onPress}
    >
      <TextStyle smallParagraph color={textColor}>
        {title}
      </TextStyle>
      <View style={{ marginLeft: 8 }}>
        <Ionicons
          name="caret-up"
          color={textColor}
          size={6}
          style={{ opacity: value === true ? 1 : 0.3 }}
        />
        <Ionicons
          name="caret-down"
          color={textColor}
          size={6}
          style={{ opacity: value === false ? 1 : 0.3 }}
        />
      </View>
    </ButtonStyle>
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
  const [filters, setFilters] = useState({
    plate: null,
    table: null,
    time: null,
  });

  const dispatch = useDispatch();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const found = (status) => {
      const filtered = kitchen.filter((k) => k.status === status).reverse();
      return filtered.sort((a, b) => {
        if (filters.time === true) return new Date(a.creationDate) - new Date(b.creationDate);
        if (filters.time === false) return new Date(b.creationDate) - new Date(a.creationDate);
        if (filters.table === true) return a.title.value - b.title.value;
        if (filters.table === false) return b.title.value - a.title.value;
        if (filters.plate === true)
          return (
            a.selection.reduce((a, b) => a + b.quantity, 0) -
            b.selection.reduce((a, b) => a + b.quantity, 0)
          );
        if (filters.plate === false)
          return (
            b.selection.reduce((a, b) => a + b.quantity, 0) -
            a.selection.reduce((a, b) => a + b.quantity, 0)
          );
      });
    };

    setProcessing(found("processing"));
    setPending(found("pending"));
    setPrepared(found("prepared"));
    setError(found("error"));
  }, [kitchen, filters]);

  const filterEvent = (value) =>
    setFilters({
      ...Object.keys(filters)
        .filter((f) => f !== value)
        .reduce((a, b) => ({ ...a, [b]: null }), {}),
      [value]: filters[value] === null ? false : filters[value] === false ? true : null,
    });

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

  const deleteKitchen = () =>
    Alert.alert(
      `¿Está seguro?`,
      "¿Desea eliminar toda la información de cocina? No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(clean());
            await editUser({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              change: { kitchen: [] },
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );

  return (
    <Layout>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextStyle smallSubtitle color={textColor} style={{ marginRight: 10 }}>
          COCINA
        </TextStyle>
        <Ionicons name="bonfire-outline" color={light.main2} size={30} />
      </View>
      <View style={[styles.row, { marginVertical: 10 }]}>
        <ButtonStyle
          backgroundColor={light.main2}
          style={{ width: "auto", marginHorizontal: 2, paddingHorizontal: 12 }}
          onPress={() => deleteKitchen()}
        >
          <TextStyle center smallParagraph>
            Eliminar todo
          </TextStyle>
        </ButtonStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FilterButton value={filters.plate} onPress={() => filterEvent("plate")} title="Plato" />
          <FilterButton value={filters.table} onPress={() => filterEvent("table")} title="Mesa" />
          <FilterButton value={filters.time} onPress={() => filterEvent("time")} title="Tiempo" />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT / 1.3 }}>
        <Section
          title="Solicitado"
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
          title="Procesando"
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
          title="Disponible"
          information="Son aquellas órdenes que se han preparado y están esperando a su despacho final por el mesero"
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
          title="Fallido"
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
