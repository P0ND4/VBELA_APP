import { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { remove } from "@features/zones/nomenclaturesSlice";
import { removeMany as removeManyRS } from "@features/zones/standardReservationsSlice";
import { removeMany as removeManyRA } from "@features/zones/accommodationReservationsSlice";
import { changeDate, thousandsSystem } from "@helpers/libs";
import { removeNomenclature } from "@api";
import helperNotification from "@helpers/helperNotification";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();

const PlaceInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zone = useSelector((state) => state.zones);
  const user = useSelector((state) => state.user);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const helperStatus = useSelector((state) => state.helperStatus);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const zoneID = route.params.zoneID;
  const nomenclatureID = route.params.nomenclatureID;

  const [zoneName, setZoneName] = useState(null);
  const [nomenclature, setNomenclature] = useState(null);
  const [totalMoney, setTotalMoney] = useState(null);
  const [totalPeople, setTotalPeople] = useState(null);
  const [totalDays, setTotalDays] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setNomenclature(nomenclatures.find((n) => n.id === nomenclatureID));
    setZoneName(zone.find((z) => z.id === zoneID)?.name);
  }, [zone, nomenclatures]);

  useEffect(() => {
    navigation.setOptions({
      title: nomenclature?.name || nomenclature?.nomenclature,
    });
  }, [nomenclature]);

  useEffect(() => {
    const getMoney = (reservations) =>
      reservations.reduce((a, b) => {
        if (b.payment?.length) return a + b.payment?.reduce((a, b) => a + b?.amount, 0);
        return a;
      }, 0);

    const getDays = (reservations) => reservations.reduce((a, b) => a + b.days, 0);
    const getPeople = (reservations) => reservations.reduce((a, b) => a + b?.hosted?.length || 1, 0);

    const standard = standardReservations.filter((s) => s.ref === nomenclatureID);
    const accommodation = accommodationReservations.filter((a) => a.ref === nomenclatureID);

    setTotalMoney(getMoney(standard) + getMoney(accommodation));
    setTotalDays(getDays(standard) + getDays(accommodation));
    setTotalPeople(getPeople(standard) + getPeople(accommodation));
  }, [standardReservations, accommodationReservations]);

  return (
    <Layout
      style={{
        justifyContent: "center",
        alignItem: "center",
        padding: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextStyle smallTitle color={mode === "light" ? light.textDark : dark.textWhite}>
          Información
        </TextStyle>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("CreatePlace", {
              item: nomenclature,
              zoneID,
              editing: true,
            });
          }}
        >
          <Ionicons name="create-outline" size={36} color={light.main2} />
        </TouchableOpacity>
      </View>
      <TextStyle smallSubtitle color={light.main2}>
        Nomenclatura
      </TextStyle>
      <View style={{ marginVertical: 30 }}>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Dinero total: <TextStyle color={light.main2}>{thousandsSystem(totalMoney || "0")}</TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Personas reservadas:{" "}
          <TextStyle color={light.main2}>{thousandsSystem(totalPeople || "0")}</TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Total de días reservado:{" "}
          <TextStyle color={light.main2}>{thousandsSystem(totalDays || "0")}</TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Ultima actualización:{" "}
          <TextStyle color={light.main2}>
            {changeDate(new Date(nomenclature?.modificationDate))}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Fecha de creación:{" "}
          <TextStyle color={light.main2}>{changeDate(new Date(nomenclature?.creationDate))}</TextStyle>
        </TextStyle>
      </View>
      <ButtonStyle
        backgroundColor={light.main2}
        onPress={() => {
          Alert.alert(
            "¿Estás seguro?",
            "Se eliminarán todos los datos de esta nomenclatura",
            [
              {
                text: "No estoy seguro",
                style: "cancel",
              },
              {
                text: "Estoy seguro",
                onPress: async () => {
                  dispatch(remove({ id: nomenclatureID }));
                  dispatch(removeManyRS({ ref: nomenclatureID }));
                  dispatch(removeManyRA({ ref: nomenclatureID }));
                  navigation.pop();
                  await removeNomenclature({
                    identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
                    id: nomenclatureID,
                    helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
                  });

                  await helperNotification(
                    helperStatus,
                    user,
                    "Removido todas las reservas",
                    `Se han eliminado todas las reservas en (${zoneName} | ${nomenclature.nomenclature})`,
                    "accessToReservations"
                  );
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <TextStyle center>Eliminar nomenclatura</TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

export default PlaceInformation;
