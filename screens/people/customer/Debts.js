import { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert
} from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();

  const leftSwipe = () => (
    <View style={{ justifyContent: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => Alert.alert("PROXIMAMENTE", "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR")}
      >
        <Ionicons
          name="information-circle-outline"
          color={mode === "light" ? dark.main2 : light.main5}
          size={getFontSize(21)}
        />
      </TouchableOpacity>
    </View>
  );

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: "red" }]}
        onPress={() => Alert.alert("PROXIMAMENTE", "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR")}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderLeftActions={leftSwipe} renderRightActions={rightSwipe}>
      <TouchableOpacity
        style={[
          styles.card,
          styles.row,
          { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
        ]}
        onPress={() => {
          if (item.details === "accommodation")
            navigation.navigate("AccommodationReserveInformation", { ids: [item.id] });
          if (item.details === "standard")
            navigation.navigate("StandardReserveInformation", { id: item.id });
        }}
      >
        <TextStyle color={textColor}>
          {item.details === "accommodation" ? "Acomodación" : "Estandar"}
        </TextStyle>
        <TextStyle color={light.main2}>{thousandsSystem(item.debt || "0")}</TextStyle>
      </TouchableOpacity>
    </Swipeable>
  );
};

const Debts = () => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const [debts, setDebts] = useState(null);

  useEffect(() => {
    const ids = customers.flatMap((c) =>
      c.special ? c.clientList?.map((c) => c.id) : [c.id]
    );

    const filterInformation = (reservations) =>
      reservations.map((r) => ({ id: r.id, details: r.type, debt: r.total }));

    const accommodation = standardReservations.filter(
      (s) => s.status === "credit" && s.hosted.some((h) => h.owner && ids.includes(h.owner))
    );
    const standard = accommodationReservations.filter(
      (a) => a.status === "credit" && a.owner && ids.includes(a.owner)
    );

    const debts = [...filterInformation(accommodation), ...filterInformation(standard)];
    setDebts(debts.sort((d) => d.creationDate));
  }, [customers, standardReservations, accommodationReservations]);

  return (
    <Layout>
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          Deudas
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* {debts?.length > 0 && (
            <TouchableOpacity onPress={() => removeEverything()}>
              <Ionicons
                name="trash"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )} */}
          {/* {debts?.length > 0 && (
            <TouchableOpacity onPress={() => print({ html })}>
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )} */}
          {/* {debts?.length > 0 && (
            <TouchableOpacity onPress={() => generatePDF({ html })}>
              <Ionicons
                name="document-attach"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )} */}
          {/*logs?.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )*/}
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        {!debts && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={light.main2} size="large" />
            <TextStyle
              style={{ marginTop: 8 }}
              center
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              CARGANDO
            </TextStyle>
          </View>
        )}
        {debts?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY REGISTROS
          </TextStyle>
        )}
        {debts && (
          <FlatList
            data={debts}
            style={{
              flexGrow: 1,
              maxHeight: SCREEN_HEIGHT / 1.3,
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={2}
            renderItem={({ item }) => <Card item={item} />}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default Debts;
