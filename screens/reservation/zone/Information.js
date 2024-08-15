import { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { remove } from "@features/zones/informationSlice";
import { removeMany as removeManyN } from "@features/zones/nomenclaturesSlice";
import { removeManyByManyRefs as removeManyByManyRefsRS } from "@features/zones/standardReservationsSlice";
import { removeManyByManyRefs as removeManyByManyRefsRA } from "@features/zones/accommodationReservationsSlice";
import { changeDate, thousandsSystem } from "@helpers/libs";
import { removeZone } from "@api";
import helperNotification from "@helpers/helperNotification";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();

const PlaceInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zoneState = useSelector((state) => state.zones);
  const user = useSelector((state) => state.user);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const helperStatus = useSelector((state) => state.helperStatus);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );

  const [zone, setZone] = useState(null);
  const [nomenclaturesIDS, setNomenclaturesIDS] = useState([]);
  const [totalMoney, setTotalMoney] = useState(null);
  const [totalPeople, setTotalPeople] = useState(null);
  const [totalDays, setTotalDays] = useState(null);

  const zoneID = route.params.zoneID;

  const dispatch = useDispatch();

  useEffect(() => {
    setNomenclaturesIDS(
      nomenclatures.filter((n) => n.ref === zoneID).map((n) => n.id)
    );
    setZone(zoneState.find((zone) => zone.id === zoneID));
  }, [zoneState, nomenclatures]);

  useEffect(() => {
    navigation.setOptions({ title: zone?.name });
  }, [zone]);

  useEffect(() => {
    const getMoney = (reservations) =>
      reservations.reduce((a, b) => {
        if (b.payment.length) return a + b.payment?.reduce((a, b) => a + b.amount, 0);
        return a;
      }, 0);

    const getDays = (reservations) =>
      reservations.reduce((a, b) => a + b.days, 0);

    const getPeople = (reservations) =>
      reservations.reduce((a, b) => a + b?.hosted?.length || 1, 0);

    const standard = standardReservations.filter((s) =>
      nomenclaturesIDS.includes(s.ref)
    );
    const accommodation = accommodationReservations.filter((a) =>
      nomenclaturesIDS.includes(a.ref)
    );

    setTotalMoney(getMoney(standard) + getMoney(accommodation));
    setTotalDays(getDays(standard) + getDays(accommodation));
    setTotalPeople(getPeople(standard) + getPeople(accommodation));
  }, [nomenclaturesIDS, standardReservations, accommodationReservations]);

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
        <TextStyle
          smallTitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Información
        </TextStyle>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CreateZone", { item: zone, editing: true })
          }
        >
          <Ionicons
            name="create-outline"
            size={36}
            color={light.main2}
          />
        </TouchableOpacity>
      </View>
      <TextStyle smallSubtitle color={light.main2}>
        Zona
      </TextStyle>
      {(zone?.description || zone?.location) && (
        <View style={{ marginTop: 14 }}>
          {zone?.description && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {zone?.description}
            </TextStyle>
          )}
          {zone?.location && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Ubicacion:{" "}
              <TextStyle color={light.main2}>{zone?.location}</TextStyle>
            </TextStyle>
          )}
        </View>
      )}
      <View style={{ marginVertical: 30 }}>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Dinero total:{" "}
          <TextStyle color={light.main2}>
            {thousandsSystem(totalMoney || "0")}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Personas reservadas:{" "}
          <TextStyle color={light.main2}>
            {thousandsSystem(totalPeople || "0")}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Total de días reservado:{" "}
          <TextStyle color={light.main2}>
            {thousandsSystem(totalDays || "0")}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Ultima actualización:{" "}
          <TextStyle color={light.main2}>
            {changeDate(new Date(zone?.modificationDate))}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Fecha de creación:{" "}
          <TextStyle color={light.main2}>
            {changeDate(new Date(zone?.creationDate))}
          </TextStyle>
        </TextStyle>
      </View>
      <ButtonStyle
        backgroundColor={light.main2}
        onPress={() => {
          Alert.alert(
            "¿Estás seguro?",
            "Se eliminarán todos los datos de esta zona",
            [
              {
                text: "No estoy seguro",
                style: "cancel",
              },
              {
                text: "Estoy seguro",
                onPress: async () => {
                  dispatch(removeManyByManyRefsRS({ refs: nomenclaturesIDS }));
                  dispatch(removeManyByManyRefsRA({ refs: nomenclaturesIDS }));
                  dispatch(removeManyN({ ref: zoneID }));
                  dispatch(remove({ id: zoneID }));
                  navigation.popToTop();
                  await removeZone({
                    identifier: helperStatus.active
                      ? helperStatus.identifier
                      : user.identifier,
                    id: zoneID,
                    refs: nomenclaturesIDS,
                    helpers: helperStatus.active
                      ? [helperStatus.id]
                      : user.helpers.map((h) => h.id),
                  });

                  await helperNotification(
                    helperStatus,
                    user,
                    "Removido todas las reservas",
                    `Se han eliminado todas las reservas del grupo (${zone.name})`,
                    "accessToReservations"
                  );
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <TextStyle center>Eliminar zona</TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

export default PlaceInformation;
