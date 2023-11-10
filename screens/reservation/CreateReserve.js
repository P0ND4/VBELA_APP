import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addReservation, editReservation } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import {
  add as addRS,
  edit as editRS,
} from "@features/zones/standardReservationsSlice";
import { add as addRA } from "@features/zones/accommodationReservationsSlice";
import helperNotification from "@helpers/helperNotification";
import {
  addDays,
  changeDate,
  months,
  random,
  thousandsSystem,
  getFontSize,
} from "@helpers/libs";
import theme from "@theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import AddPerson from "@components/AddPerson";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateReserve = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const helperStatus = useSelector((state) => state.helperStatus);

  const personStaying = route.params?.hosted;

  const editing = route.params?.editing;
  const reserve = route.params?.reserve;
  const place = route.params?.place;

  const [loading, setLoading] = useState(false);
  const [nomenclature, setNomenclature] = useState({});
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);

  const [hosted, setHosted] = useState(
    editing ? reserve.hosted : personStaying || []
  );

  const [editingHosted, setEditingHosted] = useState({
    key: Math.random(),
    active: false,
  });

  const [days, setDays] = useState(editing ? String(reserve.days) : "");
  const [amount, setAmount] = useState("");
  const [amountWithDiscount, setAmountWithDiscount] = useState("");
  const [discount, setDiscount] = useState(
    editing ? thousandsSystem(reserve.discount || "") : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setNomenclature(nomenclaturesState.find((n) => n.id === place.id));
  }, [place]);

  const cleanDiscount = () => {
    setDiscount("");
    setValue("discount", null);
  };

  useEffect(() => {
    (() => {
      const accommodationSelected = place?.accommodation;
      const amount =
        place.type === "standard"
          ? place.value * days
          : accommodationSelected?.accommodation?.reduce(
              (a, b) => a + b.value,
              0
            );

      setAmount(amount);
      if (discount)
        setAmountWithDiscount(amount - discount.replace(/[^0-9]/g, ""));
    })();
  }, [hosted.length, days, discount, nomenclature, place]);

  useEffect(() => {
    register("hosted", {
      value: editing ? reserve.hosted : personStaying || [],
      validate: {
        min: (value) => value.length > 0 || "Tiene que haber mínimo 1 huésped",
      },
    });
    register("type", { value: place.type });
    register("payment", { value: editing ? reserve.payment : 0 });
    register("discount", { value: editing ? reserve.discount : null });

    if (place.type === "standard") {
      register("days", {
        value: editing ? reserve.days : "",
        required: true,
        validate: {
          zero: (num) => num > 0 || "Digíte los dias a reservar",
          days: (num) => {
            const day = route.params.day;
            const month = route.params.month - 1;
            const year = route.params.year;

            if (place.type === "accommodation") return true;
            
            const currentReservations = editing
              ? standardReservations.filter(
                  (r) => r.ref !== reserve.ref && r.id === place.id
                )
              : standardReservations.filter((r) => r.id === place.id);

            for (let i = 0; i < num; i++) {
              const endDay = addDays(new Date(year, month, day), i);
              for (let reserve of currentReservations) {
                const start = new Date(reserve.start);
                const end = new Date(reserve.end);

                if (endDay >= start && endDay <= end)
                  return `El número de días choca con esta fecha reservada: ${changeDate(
                    endDay
                  )} sólo alcanza para reservar ${i} ${
                    i === 1 ? "día" : "días"
                  }`;
              }
            }
          },
        },
      });
    }
  }, []);

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const date = new Date(reserve.start);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

    data.ref = reserve.ref;
    data.start = reserve.start;
    data.id = reserve.id;
    data.end = end.getTime();
    data.amount = amount;
    data.creationDate = reserve.creationDate;
    data.modificationDate = new Date().getTime();

    dispatch(editRS({ ref: reserve.ref, data }));
    navigation.pop();

    await editReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: {
        data,
        type: place.type,
      },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      helperStatus,
      user,
      "Reservación editada",
      `Una reservación ha sido editada por ${days} días, por el usuario ${
        user.identifier
      }, desde ${changeDate(new Date(data.start))} hasta ${changeDate(
        new Date(data.end)
      )}`,
      "accessToReservations"
    );
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const ref = random(10, { number: true });
    const reservations = [];
    const found = (r) =>
      r.filter((r) => r.id === place.id).find((re) => re.ref === ref);

    const exists =
      place.type === "standard"
        ? found(standardReservations)
        : found(accommodationReservations);

    if (exists) return onSubmitCreate(data);

    const day = route.params.day;
    const month = route.params.month - 1;
    const year = route.params.year;

    if (place.type === "accommodation") {
      for (let h of hosted) {
        const obj = { ...h };
        const end = addDays(new Date(year, month, day), parseInt(h.days - 1));
        obj.end = end.getTime();
        obj.start = new Date(year, month, day).getTime();
        obj.amount = amount;

        obj.discount = data.discount;
        obj.type = data.type;
        obj.accommodation = data.accommodation;
        obj.payment = 0;
        obj.creationDate = new Date().getTime();
        obj.modificationDate = new Date().getTime();
        reservations.push(obj);
        dispatch(addRA(obj));
      }
    }

    if (place.type === "standard") {
      const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

      data.start = new Date(year, month, day).getTime();
      data.end = end.getTime();
      data.amount = amount;
      data.id = place.id;
      data.ref = ref;
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();

      dispatch(addRS(data));
    }

    navigation.pop();
    await addReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: {
        data: place.type === "accommodation" ? reservations : data,
        type: place.type,
      },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      helperStatus,
      user,
      "Reservación creada",
      `Una reservación de ${days} días ha sido creada por ${
        user.identifier
      } desde ${changeDate(new Date(data.start))} hasta ${changeDate(
        new Date(data.end)
      )}`,
      "accessToReservations"
    );
  };

  const updateHosted = ({ data, cleanData }) => {
    data.id = editingHosted.id;
    data.ref = editingHosted.ref;
    data.owner = editingHosted.owner;
    data.checkOut = editingHosted.checkOut;

    const newArray = hosted.map((h) => {
      if (h.id === editingHosted.id) return data;
      return h;
    });
    setHosted(newArray);
    setValue("hosted", newArray);
    cleanData();
  };

  const saveHosted = ({ data, cleanData }) => {
    const id = random(10, { number: true });
    data.ref = place.id;
    data.id = id;
    data.owner = null;
    data.checkOut = null;
    setHosted([...hosted, data]);
    setValue("hosted", [...hosted, data]);
    cleanData();
  };

  return (
    <Layout
      style={{
        marginTop: 0,
        padding: 30,
      }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItem: "center",
              flex: 1,
            }}
          >
            <View style={{ width: "100%" }}>
              <View style={styles.header}>
                <TextStyle
                  smallTitle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {months[route.params.month - 1]?.toUpperCase()}{" "}
                  {("0" + route.params.day).slice(-2)}
                </TextStyle>
                <TextStyle smallTitle color={light.main2}>
                  {route.params.year}
                </TextStyle>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TextStyle
                  bigParagraph
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {nomenclature.name || nomenclature.nomenclature}
                </TextStyle>
                <TextStyle
                  customStyle={{ marginLeft: 5 }}
                  bigParagraph
                  color={light.main2}
                >
                  {place.type === "standard" ? "Estandar" : "Acomodación"}
                </TextStyle>
              </View>
            </View>
            <View style={{ marginVertical: 30 }}>
              <ScrollView
                style={{ maxHeight: 220 }}
                showsVerticalScrollIndicator={false}
              >
                {hosted.map((item) => {
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.row,
                        {
                          marginVertical: 4,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                          borderRadius: 8,
                        },
                      ]}
                    >
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {`${item.fullName.slice(0, 20)}${
                          item.fullName.length > 20 ? "..." : ""
                        }`}
                      </TextStyle>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingHosted({
                              key: Math.random(),
                              active: true,
                              ...item,
                            });
                            setModalVisiblePeople(!modalVisiblePeople);
                          }}
                        >
                          <Ionicons
                            name="create-outline"
                            size={getFontSize(19)}
                            style={{ marginHorizontal: 4 }}
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                          />
                        </TouchableOpacity>
                        {(!personStaying ||
                          item.id !== personStaying[0].id) && (
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                "Eliminar",
                                `¿Quieres eliminar el huésped ${item.fullName}?`,
                                [
                                  {
                                    text: "No",
                                    style: "cancel",
                                  },
                                  {
                                    text: "Si",
                                    onPress: async () => {
                                      const newArray = hosted.filter(
                                        (h) => h.id !== item.id
                                      );
                                      setHosted(newArray);
                                      setValue("hosted", newArray);
                                    },
                                  },
                                ],
                                { cancelable: true }
                              );
                            }}
                          >
                            <Ionicons
                              name="trash"
                              size={getFontSize(19)}
                              style={{ marginHorizontal: 4 }}
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              {(place.type === "accommodation" ||
                hosted.length < place.people) && (
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setModalVisiblePeople(!modalVisiblePeople)}
                >
                  <TextStyle>Agregar persona</TextStyle>
                  <Ionicons
                    name="person-add"
                    color={light.textDark}
                    size={getFontSize(16)}
                    style={{ marginLeft: 10 }}
                  />
                </ButtonStyle>
              )}
              {place.type === "standard" && hosted.length >= place.people && (
                <TextStyle
                  customStyle={{ marginVertical: 6 }}
                  smallParagraph
                  color={light.main2}
                  center
                >
                  {`El límite de la habitación es de ${
                    place.people === 1
                      ? "1 huésped"
                      : `${place.people} huéspedes`
                  }`}
                </TextStyle>
              )}
              {errors.hosted?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.hosted?.message}
                </TextStyle>
              )}
              {place.type === "standard" && (
                <InputStyle
                  placeholder="Número de días"
                  value={days}
                  right={
                    days
                      ? () => <TextStyle color={light.main2}>Días</TextStyle>
                      : null
                  }
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    setDays(num.replace(/[^0-9]/g, ""));
                    setValue("days", parseInt(num) || "");
                    cleanDiscount();
                  }}
                  maxLength={3}
                />
              )}
              {errors.days?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.days.type === "required"
                    ? "Digíte los dias a reservar"
                    : errors.days.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Descuento (En valor)"
                value={discount}
                right={
                  discount
                    ? () => <TextStyle color={light.main2}>Descuento</TextStyle>
                    : null
                }
                keyboardType="numeric"
                onChangeText={(text) => {
                  const value = text.replace(/[^0-9]/g, "");

                  if (value > amount) return;
                  setValue("discount", parseInt(value) || null);
                  setDiscount(thousandsSystem(value));
                }}
              />
            </View>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Huéspedes:{" "}
              <TextStyle color={light.main2} smallSubtitle>
                {thousandsSystem(hosted.length)}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Total
              {!discount && place.type === "standard" ? " a pagar" : " por día"}
              :{" "}
              <TextStyle color={light.main2} smallSubtitle>
                {thousandsSystem(amount || "0")}
              </TextStyle>
            </TextStyle>
            {discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Descuento:{" "}
                <TextStyle color={light.main2} smallSubtitle>
                  {discount}
                </TextStyle>
              </TextStyle>
            )}
            {discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Total a pagar:{" "}
                <TextStyle color={light.main2} smallSubtitle>
                  {thousandsSystem(amountWithDiscount)}
                </TextStyle>
              </TextStyle>
            )}
            <ButtonStyle
              style={{ marginTop: 30 }}
              backgroundColor={light.main2}
              onPress={handleSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
            >
              <TextStyle center>{editing ? "Guardar" : "Reservar"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AddPerson
        key={editingHosted.key}
        modalVisible={modalVisiblePeople}
        type={place.type}
        setModalVisible={setModalVisiblePeople}
        editing={editingHosted}
        setEditing={setEditingHosted}
        handleSubmit={(data) => {
          if (editingHosted.active) updateHosted(data);
          else saveHosted(data);
        }}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default CreateReserve;
