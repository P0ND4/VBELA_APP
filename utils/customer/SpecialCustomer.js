import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import AddReservation from "./AddReservation";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const SpecialCustomer = ({ item, salesHandler }) => {
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const textColor = (condition) =>
    condition ? light.textDark : mode === "light" ? dark.textWhite : light.textDark;

  const backgroundColor = (condition) =>
    condition ? light.main2 : mode === "light" ? dark.main2 : light.main4;

  const [isName, setIsName] = useState(true);
  const [reservationFound, setReservationFound] = useState(null);
  const [personSelected, setPersonSelected] = useState(null);
  const [modalVisibleChooseDate, setModalVisibleChooseDate] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const allReservations = [...standardReservations, ...accommodationReservations];
    const found = allReservations.find(
      (r) => r?.owner === item.id || r?.hosted?.find((h) => h.owner === item.id)
    );
    setReservationFound(found);
  }, [standardReservations, accommodationReservations]);

  const reservationHandler = ({ reservation, item }) => {
    if (reservation) {
      if (reservation.type === "accommodation")
        return navigation.navigate("AccommodationReserveInformation", {
          ids: [reservation.id],
        });
      else return navigation.navigate("StandardReserveInformation", { id: reservation.id });
    }
    setPersonSelected(item);
    setModalVisibleChooseDate(!modalVisibleChooseDate);
  };

  if (reservationFound === null) return <View />;

  return (
    <>
      <View style={[styles.row, { marginVertical: 2 }]}>
        <TouchableOpacity onPress={() => item.identification && setIsName(!isName)}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {isName
              ? item?.name?.slice(0, 25) + `${item?.name?.length >= 25 ? "..." : ""}`
              : thousandsSystem(item?.identification)}
          </TextStyle>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {(() => {
            const exists =
              orders.some((o) => o.ref === item.id && o.status === "pending") ||
              sales.some((o) => o.ref === item.id && o.status === "pending");
            return (
              <TouchableOpacity
                style={[styles.swipe, { backgroundColor: backgroundColor(!exists) }]}
                onPress={() => salesHandler({ item })}
              >
                <Ionicons name="restaurant-outline" size={getFontSize(20)} color={textColor(!exists)} />
              </TouchableOpacity>
            );
          })()}
          <TouchableOpacity
            style={[styles.swipe, { backgroundColor: backgroundColor(!reservationFound) }]}
            onPress={() => reservationHandler({ reservation: reservationFound, item })}
          >
            <Ionicons name="bed-outline" size={getFontSize(20)} color={textColor(!reservationFound)} />
          </TouchableOpacity>
        </View>
      </View>
      <AddReservation
        personSelected={personSelected}
        modalVisible={modalVisibleChooseDate}
        setModalVisible={setModalVisibleChooseDate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default SpecialCustomer;
