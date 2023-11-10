import { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { remove as removeZoneRedux } from "@features/zones/informationSlice";
import {
  remove,
  removeMany as removeManyNomenclature,
} from "@features/zones/nomenclaturesSlice";
import { removeMany as removeManyRS } from "@features/zones/standardReservationsSlice";
import { removeMany as removeManyRA } from "@features/zones/accommodationReservationsSlice";
import { changeDate, thousandsSystem, getFontSize } from "@helpers/libs";
import { removeZone, removeNomenclature } from "@api";
import helperNotification from "@helpers/helperNotification";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const PlaceInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zoneState = useSelector((state) => state.zones);
  const user = useSelector((state) => state.user);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const nomenclatureState = useSelector((state) => state.nomenclatures);
  const helperStatus = useSelector((state) => state.helperStatus);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );

  const [zone, setZone] = useState(null);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [nomenclature, setNomenclature] = useState(null);
  const [totalMoney, setTotalMoney] = useState(null);
  const [totalPeople, setTotalPeople] = useState(null);
  const [totalDays, setTotalDays] = useState(null);

  const dispatch = useDispatch();
  const params = route.params;

  useEffect(() => {
    setNomenclatures(
      nomenclaturesState.filter((n) => n.ref === route.params.ref)
    );
    setNomenclature(nomenclatureState.find((n) => n.id === route.params.id));
    setZone(zoneState.find((zone) => zone.ref === route.params.ref));
  }, [zoneState, nomenclatureState, nomenclaturesState]);

  useEffect(() => {
    if (params.type === "General") navigation.setOptions({ title: zone?.name });
    else
      navigation.setOptions({
        title: nomenclature?.name
          ? nomenclature?.name
          : nomenclature?.nomenclature,
      });
  }, [zone, nomenclature]);

  useEffect(() => {
    let totalMoney = 0;
    let totalDays = 0;
    let totalPeople = 0;

    const getInformation = (reservations, amount) => {
      totalMoney += amount;
      totalDays += parseInt(reservations.days);
      totalPeople += parseInt(reservations?.hosted?.length || 1);
    };

    const eventHandler = (id) => {
      const date = new Date().getTime();
      const currentStandardReservations = standardReservations.filter(
        (r) => r.id === id && r.end > date
      );
      const currentAccommodationReservations = accommodationReservations.filter(
        (r) => r.ref === id && r.end > date
      );

      for (let h of currentStandardReservations) {
        const amount = h.discount ? h.amount - h.discount : h.amount;
        getInformation(h, amount);
      }
      for (let h of currentAccommodationReservations) {
        const amount =
          h.days * (h?.discount ? h.amount - h.discount : h.amount);
        getInformation(h, amount);
      }
    };

    if (params.type === "General") {
      for (let n of nomenclatures) {
        eventHandler(n.id);
      }
    } else eventHandler(route.params.id);

    setTotalMoney(totalMoney);
    setTotalDays(totalDays);
    setTotalPeople(totalPeople);
  }, [nomenclatures, standardReservations, accommodationReservations]);

  return (
    <Layout
      style={{
        marginTop: 0,
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
          onPress={() => {
            navigation.navigate(
              params.type === "General" ? "CreateZone" : "CreatePlace",
              {
                item: params.type === "General" ? zone : nomenclature,
                ref: route.params.ref,
                id: route.params.id,
                editing: true,
              }
            );
          }}
        >
          <Ionicons
            name="create-outline"
            size={getFontSize(31)}
            color={light.main2}
          />
        </TouchableOpacity>
      </View>
      <TextStyle smallSubtitle color={light.main2}>
        {params.type}
      </TextStyle>
      {params.type === "General" && (zone?.description || zone?.location) && (
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
            {totalMoney ? thousandsSystem(totalMoney) : "0"}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Personas reservadas:{" "}
          <TextStyle color={light.main2}>
            {totalPeople ? thousandsSystem(totalPeople) : "0"}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Total de días reservado:{" "}
          <TextStyle color={light.main2}>
            {totalPeople ? thousandsSystem(totalDays) : "0"}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Ultima actualización:{" "}
          <TextStyle color={light.main2}>
            {changeDate(
              new Date(
                params.type === "General"
                  ? zone?.modificationDate
                  : nomenclature?.modificationDate
              )
            )}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Fecha de creación:{" "}
          <TextStyle color={light.main2}>
            {changeDate(
              new Date(
                params.type === "General"
                  ? zone?.creationDate
                  : nomenclature?.creationDate
              )
            )}
          </TextStyle>
        </TextStyle>
      </View>
      <ButtonStyle
        backgroundColor={light.main2}
        onPress={() => {
          Alert.alert(
            "¿Estás seguro?",
            `Se eliminarán todos los datos de esta ${
              params.type === "General" ? "categoría" : "nomenclatura"
            }`,
            [
              {
                text: "No estoy seguro",
                style: "cancel",
              },
              {
                text: "Estoy seguro",
                onPress: async () => {
                  if (params.type === "General") {
                    const ids = [];
                    for (let n of nomenclatures) {
                      dispatch(removeManyRS({ ref: n.id }));
                      dispatch(removeManyRA({ ref: n.id }));

                      ids.push(n.id);
                    }
                    dispatch(removeManyNomenclature({ ref: route.params.ref }));
                    dispatch(removeZoneRedux({ ref: route.params.ref }));
                    navigation.popToTop();
                    await removeZone({
                      identifier: helperStatus.active
                        ? helperStatus.identifier
                        : user.identifier,
                      ref: route.params.ref,
                      ids,
                      helpers: helperStatus.active
                        ? [helperStatus.id]
                        : user.helpers.map((h) => h.id),
                    });
                  } else {
                    dispatch(remove({ id: route.params.id }));
                    dispatch(removeManyRS({ ref: route.params.id }));
                    dispatch(removeManyRA({ ref: route.params.id }));
                    navigation.pop();
                    await removeNomenclature({
                      identifier: helperStatus.active
                        ? helperStatus.identifier
                        : user.identifier,
                      id: route.params.id,
                      helpers: helperStatus.active
                        ? [helperStatus.id]
                        : user.helpers.map((h) => h.id),
                    });
                  }

                  await helperNotification(
                    helperStatus,
                    user,
                    "Removido todas las reservas",
                    `Se han eliminado todas las reservas ${
                      params.type === "General"
                        ? `del grupo (${zone.name})`
                        : `en (${zone.name} | ${nomenclature.nomenclature})`
                    }`,
                    "accessToReservations"
                  );
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <TextStyle center>
          Eliminar{" "}
          {params.type === "Nomenclatura" ? "nomenclatura" : "Categoría"}
        </TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

export default PlaceInformation;
