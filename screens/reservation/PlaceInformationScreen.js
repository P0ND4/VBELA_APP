import { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { remove as removeZone } from "@features/groups/informationSlice";
import {
  remove,
  removeMany as removeManyNomenclature,
} from "@features/groups/nomenclaturesSlice";
import { removeMany as removeManyReservation } from "@features/groups/reservationsSlice";
import { changeDate, thousandsSystem } from "@helpers/libs";
import { removeGroup, removeNomenclature } from "@api";
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
  const groupState = useSelector((state) => state.groups);
  const user = useSelector((state) => state.user);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const nomenclatureState = useSelector((state) => state.nomenclatures);
  const activeGroup = useSelector((state) => state.activeGroup);
  const reservations = useSelector((state) => state.reservations);

  const [group, setGroup] = useState(null);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [nomenclature, setNomenclature] = useState(null);
  const [totalMoney, setTotalMoney] = useState(null);
  const [totalPeople, setTotalPeople] = useState(null);
  const [totalDays, setTotalDays] = useState(null);

  const dispatch = useDispatch();
  const params = route.params;

  useEffect(() => {
    setNomenclatures(nomenclaturesState.filter((n) => n.ref === route.params.ref));
    setNomenclature(nomenclatureState.find((n) => n.id === route.params.id));
    setGroup(groupState.find((group) => group.ref === route.params.ref))
  },[groupState, nomenclatureState, nomenclaturesState]);

  useEffect(() => {
    if (params.type === "General")
      navigation.setOptions({ title: group?.name });
    else
      navigation.setOptions({
        title: nomenclature?.name
          ? nomenclature?.name
          : nomenclature?.nomenclature,
      });
  }, [group, nomenclature]);

  useEffect(() => {
    let totalMoney = 0;
    let totalDays = 0;
    let totalPeople = 0;

    const getInformation = (reservations) => {
      totalMoney += parseInt(reservations.amount);
      totalDays += parseInt(reservations.days);
      totalPeople += parseInt(reservations.people);
    };

    if (params.type === "General") {
      for (let i = 0; i < nomenclatures.length; i++) {
        const date = new Date().getTime();
        const generalReservations = reservations.filter(
          (r) => r.id === nomenclatures[i].id && r.end > date
        );

        for (let n of generalReservations) {
          getInformation(n);
        }
      }
    } else {
      const date = new Date().getTime();
      const currentReservations = reservations.filter(
        (r) => r.id === route.params.id && r.end > date
      );

      for (let i = 0; i < currentReservations.length; i++) {
        getInformation(currentReservations[i]);
      }
    }
    setTotalMoney(totalMoney);
    setTotalDays(totalDays);
    setTotalPeople(totalPeople);
  }, []);

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
            navigation.push(
              params.type === "General" ? "CreateZone" : "CreatePlace",
              {
                item: params.type === "General" ? group : nomenclature,
                ref: route.params.ref,
                id: route.params.id,
                editing: true,
              }
            );
          }}
        >
          <Ionicons name="create-outline" size={38} color={light.main2} />
        </TouchableOpacity>
      </View>
      <TextStyle smallSubtitle color={light.main2}>
        {params.type}
      </TextStyle>
      {params.type === "General" && (group?.description || group?.location) && (
        <View style={{ marginTop: 14 }}>
          {group?.description && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {group?.description}
            </TextStyle>
          )}
          {group?.location && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Ubicacion:{" "}
              <TextStyle color={light.main2}>{group?.location}</TextStyle>
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
                  ? group?.modificationDate
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
                  ? group?.creationDate
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
                    for (let i = 0; i < nomenclatures.length; i++) {
                      dispatch(
                        removeManyReservation({ ref: nomenclatures[i].id })
                      );

                      ids.push(nomenclatures[i].id);
                    }
                    dispatch(removeManyNomenclature({ ref: route.params.ref }));
                    dispatch(removeZone({ ref: route.params.ref }));
                    navigation.popToTop();
                    await removeGroup({
                      email: activeGroup.active
                        ? activeGroup.email
                        : user.email,
                      ref: route.params.ref,
                      ids,
                      groups: activeGroup.active ? [activeGroup.id] : user.helpers.map((h) => h.id)
                    });
                  } else {
                    dispatch(remove({ id: route.params.id }));
                    dispatch(removeManyReservation({ ref: route.params.id }));
                    navigation.pop();
                    await removeNomenclature({
                      email: activeGroup.active
                        ? activeGroup.email
                        : user.email,
                      id: route.params.id,
                      groups: activeGroup.active ? [activeGroup.id] : user.helpers.map((h) => h.id)
                    });
                  }

                  await helperNotification(
                    activeGroup,
                    user,
                    "Removido todas las reservas",
                    `Se han eliminado todas las reservas ${
                      params.type === "General"
                        ? `del grupo (${group.name})`
                        : `en (${group.name} | ${nomenclature.nomenclature})`
                    }`,
                    'accessToReservations'
                  );
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        Eliminar {params.type === "Nomenclatura" ? "nomenclatura" : "Categoría"}
      </ButtonStyle>
    </Layout>
  );
};

export default PlaceInformation;
