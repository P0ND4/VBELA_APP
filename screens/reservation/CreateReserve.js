import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  editAccommodation,
  addAccommodation,
  removeAccommodation,
  addReservation,
  editReservation,
} from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { add as addR, edit as editR } from "@features/zones/reservationsSlice";
import {
  add as addA,
  edit as editA,
  remove as removeA,
} from "@features/zones/accommodationsSlice";
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
import { Picker } from "@react-native-picker/picker";
import AddPerson from "../../components/AddPerson";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const CreateReserve = ({ route, navigation }) => {
  const {
    register: reservationRegister,
    setValue: setReservationValue,
    formState: { errors: reservationErrors },
    handleSubmit: handleReservationSubmit,
  } = useForm();

  const {
    register: accommodationRegister,
    setValue: setAccommodationValue,
    formState: { errors: accommodationErrors },
    handleSubmit: handleAccommodationSubmit,
  } = useForm();

  const {
    register: accommodationElementRegister,
    setValue: setAccommodationElementValueForm,
    formState: { errors: accommodationElementErrors },
    handleSubmit: handleAccommodationElementSubmit,
  } = useForm();

  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const reservationsState = useSelector((state) => state.reservations);
  const helperStatus = useSelector((state) => state.helperStatus);
  const accommodationState = useSelector((state) => state.accommodation);

  const personStaying = route.params?.hosted;

  const editing = route.params?.editing;
  const reserve = route.params?.reserve;

  const [loading, setLoading] = useState(false);
  const [nomenclature, setNomenclature] = useState({});
  const [reservations, setReservations] = useState([]);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [modalVisibleAccommodation, setModalVisibleAccommodation] =
    useState(false);

  const [hosted, setHosted] = useState(
    editing ? reserve.hosted : personStaying || []
  );

  const [editingHosted, setEditingHosted] = useState({
    key: Math.random(),
    active: false,
  });

  //////////
  const [accommodationElementName, setAccommodationElementName] = useState("");
  const [accommodationElementValue, setAccommodationElementValue] =
    useState("");

  //////////
  const [accommodationInformation, setAccommodationInformation] =
    useState(null);
  const [accommodationName, setAccommodationName] = useState("");
  const [accommodationSelected, setAccommodationSelected] = useState(
    editing ? reserve.accommodation || {} : {}
  );
  const [accommodation, setAccommodation] = useState([]);
  const [editingAccommodation, setEditingAccommodation] = useState({
    editing: false,
    item: null,
  });

  const [days, setDays] = useState(editing ? String(reserve.days) : "");
  const [amount, setAmount] = useState("");
  const [amountWithDiscount, setAmountWithDiscount] = useState("");
  const [discount, setDiscount] = useState(
    editing ? thousandsSystem(reserve.discount) : ""
  );
  const [valueType, setValueType] = useState(editing ? reserve.valueType : "");

  const pickerRef = useRef();
  const scrollViewAccommodationRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setReservations(reservationsState.filter((r) => r.id === route.params.id));
    setNomenclature(nomenclaturesState.find((n) => n.id === route.params.id));
  }, [route.params]);

  const cleanDiscount = () => {
    setDiscount("");
    setReservationValue("discount", "");
  };

  useEffect(() => {
    (() => {
      if (!valueType) return;
      const amount =
        valueType === "standard"
          ? hosted.length * nomenclature.value * days
          : hosted.length *
            accommodationSelected.accommodation?.reduce(
              (a, b) => a + b.value,
              0
            ) *
            days;

      setAmount(amount);
      if (discount)
        setAmountWithDiscount(amount - discount.replace(/[^0-9]/g, ""));
    })();
  }, [
    hosted.length,
    days,
    discount,
    nomenclature,
    valueType,
    accommodationSelected,
  ]);

  useEffect(() => {
    accommodationRegister("name", { value: "", required: true });
    accommodationRegister("accommodation", {
      value: [],
      validate: (value) =>
        value.length > 0 || "Tiene que haber mínimo 1 acomodación",
    });
  }, []);

  useEffect(() => {
    accommodationElementRegister("name", {
      value: "",
      required: true,
    });
    accommodationElementRegister("value", {
      value: "",
      required: true,
    });
  }, []);

  useEffect(() => {
    reservationRegister("hosted", {
      value: editing ? reserve.hosted : personStaying || [],
      validate: {
        min: (value) => value.length > 0 || "Tiene que haber mínimo 1 huésped",
        max: (value) => value.length <= 20 || "Hay un máximo de 20 huéspedes",
      },
    });
    reservationRegister("accommodation", {
      value: editing
        ? reserve.accommodation?.id
          ? reserve.accommodation
          : {}
        : {},
    });
    reservationRegister("payment", { value: editing ? reserve.payment : 0 });
    reservationRegister("discount", { value: editing ? reserve.discount : "" });
    reservationRegister("valueType", {
      value: editing ? reserve.valueType : "",
      required: true,
    });
    reservationRegister("days", {
      value: editing ? reserve.days : "",
      required: true,
      validate: {
        zero: (num) => num > 0 || "Digíte los dias a reservar",
        days: (num) => {
          const day = route.params.day;
          const month = route.params.month - 1;
          const year = route.params.year;

          const currentReservations = editing
            ? reservationsState.filter(
                (r) => r.ref !== reserve.ref && r.id === route.params.id
              )
            : reservationsState.filter((r) => r.id === route.params.id);

          for (let i = 0; i < num; i++) {
            const endDay = addDays(new Date(year, month, day), i);
            for (let reserve of currentReservations) {
              const start = new Date(reserve.start);
              const end = new Date(reserve.end);

              if (endDay >= start && endDay <= end)
                return `El número de días choca con esta fecha reservada: ${changeDate(
                  endDay
                )} sólo alcanza para reservar ${i} ${i === 1 ? "día" : "días"}`;
            }
          }
        },
      },
    });
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

    dispatch(editR({ ref: reserve.ref, data }));
    navigation.pop();

    await editReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: data,
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
    const exists = reservations.find((re) => re.ref === ref);
    if (exists) return onSubmitCreate(data);

    const day = route.params.day;
    const month = route.params.month - 1;
    const year = route.params.year;

    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

    data.start = new Date(year, month, day).getTime();
    data.end = end.getTime();
    data.amount = amount;
    data.id = route.params.id;
    data.ref = ref;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(addR(data));
    navigation.pop();
    await addReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: data,
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

  const saveAccommodationElement = (data) => {
    setAccommodationElementName("");
    setAccommodationElementValue("");
    setAccommodationElementValueForm("name", "");
    setAccommodationElementValueForm("value", "");
    data.id = random(20);
    setAccommodation([...accommodation, data]);
    setAccommodationValue("accommodation", [...accommodation, data]);
  };

  const valueTypeOptions = [
    { label: "Por acomodación", value: "accommodation" },
    { label: "Valor estandar de la nomenclatura", value: "standard" },
  ];

  const cleanDataAccommodation = () => {
    setAccommodation([]);
    setAccommodationName("");
    setAccommodationElementName("");
    setAccommodationElementValue("");

    setAccommodationValue("name", "");
    setAccommodationValue("accommodation", []);
    setAccommodationElementValueForm("name", "");
    setAccommodationElementValueForm("value", "");

    setEditingAccommodation({
      editing: false,
      item: null,
    });
  };

  const updateAccommodation = async (data) => {
    const item = editingAccommodation.item;
    data.id = item.id;
    data.creationDate = item.creationDate;
    data.modificationDate = new Date().getTime();
    cleanDataAccommodation();
    scrollViewAccommodationRef.current?.scrollTo({
      x: SCREEN_WIDTH,
      animated: true,
    });
    dispatch(editA({ id: item.id, data }));
    await editAccommodation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      accommodation: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const saveAccommodation = async (data) => {
    cleanDataAccommodation();
    data.id = random(20);
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(addA(data));
    scrollViewAccommodationRef.current?.scrollTo({
      x: SCREEN_WIDTH,
      animated: true,
    });
    await addAccommodation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      accommodation: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const deleteAccommodation = async () => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar la acomodación?`,
      "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const id = editingAccommodation.item.id;
            dispatch(removeA({ id }));
            cleanDataAccommodation();
            scrollViewAccommodationRef.current?.scrollTo({
              x: SCREEN_WIDTH,
              animated: true,
            });
            await removeAccommodation({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              id,
              helpers: helperStatus.active
                ? [helperStatus.id]
                : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const updateHosted = ({ data, cleanData }) => {
    data.id = editingHosted.id;
    data.owner = editingHosted.owner;
    data.payment = editingHosted.payment;
    data.checkOut = editingHosted.checkOut;

    const newArray = hosted.map((h) => {
      if (h.id === editingHosted.id) return data;
      return h;
    });
    setHosted(newArray);
    setReservationValue("hosted", newArray);
    cleanData();
    setDiscount("");
    setReservationValue("discount", "");
  };

  const saveHosted = ({ data, cleanData }) => {
    const id = random(20);
    data.id = id;
    data.owner = null;
    data.payment = 0;
    data.checkOut = null;
    setHosted([...hosted, data]);
    setReservationValue("hosted", [...hosted, data]);
    cleanData();
    setDiscount("");
    setReservationValue("discount", "");
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
              <TextStyle
                bigParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {nomenclature.name || nomenclature.nomenclature}
              </TextStyle>
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
                            console.log(item)
                            setEditingHosted({
                              key: Math.random(),
                              active: true,
                              ...item
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
                                      setReservationValue("hosted", newArray);
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
              {reservationErrors.hosted?.type && (
                <TextStyle verySmall color={light.main2}>
                  {reservationErrors.hosted?.message}
                </TextStyle>
              )}
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
                  setReservationValue("days", parseInt(num));
                  cleanDiscount();
                }}
                maxLength={3}
              />
              {reservationErrors.days?.type && (
                <TextStyle verySmall color={light.main2}>
                  {reservationErrors.days.type === "required"
                    ? "Digíte los dias a reservar"
                    : reservationErrors.days.message}
                </TextStyle>
              )}
              <View>
                <ButtonStyle
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => pickerRef.current?.focus()}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TextStyle
                      color={
                        valueType
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                    >
                      {valueTypeOptions.find((v) => v.value === valueType)
                        ?.label || "SELECCIONE EL TIPO DE VALOR"}
                    </TextStyle>
                    <Ionicons
                      color={
                        valueType
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                      size={getFontSize(15)}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>
                {reservationErrors.valueType?.type && (
                  <TextStyle verySmall color={light.main2}>
                    Elija el tipo de valor para la reservación
                  </TextStyle>
                )}
                <View style={{ display: "none" }}>
                  <Picker
                    ref={pickerRef}
                    style={{
                      color: mode === "light" ? light.textDark : dark.textWhite,
                    }}
                    selectedValue={valueType}
                    onValueChange={(value) => {
                      setValueType(value);
                      setReservationValue("valueType", value);
                      setAccommodationSelected({});
                      reservationRegister("accommodation", {
                        value: {},
                        validate: (obj) =>
                          value === "accommodation"
                            ? Object.keys(obj).length !== 0 ||
                              "Debe colocar la acomodación"
                            : true,
                      });
                    }}
                  >
                    <Picker.Item
                      label="SELECCIONE EL TIPO DE VALOR"
                      value=""
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {valueTypeOptions.map((item) => (
                      <Picker.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {valueType === "accommodation" && (
                <>
                  <ButtonStyle
                    backgroundColor={light.main2}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() =>
                      setModalVisibleAccommodation(!modalVisiblePeople)
                    }
                  >
                    <TextStyle>
                      {accommodationSelected?.id
                        ? `Acomodación (${accommodationSelected?.name.slice(
                            0,
                            14
                          )}${
                            accommodationSelected.name.length > 14 ? "..." : ""
                          })`
                        : "Agregar acomodación"}
                    </TextStyle>
                    <Ionicons
                      name="bed-outline"
                      color={light.textDark}
                      size={getFontSize(16)}
                      style={{ marginLeft: 10 }}
                    />
                  </ButtonStyle>
                  {reservationErrors.accommodation?.type && (
                    <TextStyle verySmall color={light.main2}>
                      {reservationErrors.accommodation.message}
                    </TextStyle>
                  )}
                </>
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
                  setReservationValue("discount", parseInt(value));
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
            {valueType && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Total{!discount ? " a pagar" : ""}:{" "}
                <TextStyle color={light.main2} smallSubtitle>
                  {thousandsSystem(amount || "0")}
                </TextStyle>
              </TextStyle>
            )}
            {valueType && discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Descuento:{" "}
                <TextStyle color={light.main2} smallSubtitle>
                  {discount}
                </TextStyle>
              </TextStyle>
            )}
            {valueType && discount && (
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
              onPress={handleReservationSubmit((data) => {
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
        setModalVisible={setModalVisiblePeople}
        editing={editingHosted}
        setEditing={setEditingHosted}
        handleSubmit={(data) => {
          if (editingHosted.active) updateHosted(data)
          else saveHosted(data);
        }}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisibleAccommodation}
        onRequestClose={() => {
          cleanDataAccommodation();
          setModalVisibleAccommodation(!modalVisibleAccommodation);
        }}
      >
        <View style={[StyleSheet.absoluteFillObject]}>
          <ScrollView
            contentOffset={{ x: SCREEN_WIDTH }}
            ref={scrollViewAccommodationRef}
            scrollEventThrottle={32}
            scrollEnabled={false}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            horizontal
          >
            <TouchableWithoutFeedback
              onPress={() => {
                cleanDataAccommodation();
                setModalVisibleAccommodation(!modalVisibleAccommodation);
              }}
            >
              <View
                style={[
                  { backgroundColor: "#0005" },
                  StyleSheet.absoluteFillObject,
                ]}
              />
            </TouchableWithoutFeedback>
            <View
              style={{
                width: SCREEN_WIDTH,
                alignItems: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      mode === "light" ? light.main4 : dark.main1,
                    height: "auto",
                  },
                ]}
              >
                <View>
                  <View style={styles.row}>
                    <TextStyle color={light.main2} bigSubtitle>
                      INFORMACIÓN
                    </TextStyle>
                    <TouchableOpacity
                      onPress={() => {
                        scrollViewAccommodationRef.current?.scrollTo({
                          x: SCREEN_WIDTH,
                          animated: true,
                        });
                        setTimeout(
                          () => setAccommodationInformation(null),
                          200
                        );
                      }}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={getFontSize(28)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Información general de la acomodación
                  </TextStyle>
                </View>
                <View style={{ marginTop: 20 }}>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Nombre:{" "}
                    <TextStyle color={light.main2}>
                      {accommodationInformation?.name}
                    </TextStyle>
                  </TextStyle>

                  <View style={{ marginVertical: 15 }}>
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                            width: SCREEN_WIDTH / 2.7,
                          },
                        ]}
                      >
                        <TextStyle color={light.main2} smallParagraph>
                          NOMBRE
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                            width: SCREEN_WIDTH / 2.7,
                          },
                        ]}
                      >
                        <TextStyle color={light.main2} smallParagraph>
                          VALOR
                        </TextStyle>
                      </View>
                    </View>
                    <FlatList
                      data={accommodationInformation?.accommodation}
                      keyExtractor={(item) => item.id}
                      style={{ maxHeight: 200 }}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => {
                        return (
                          <View style={{ flexDirection: "row" }}>
                            <View
                              style={[
                                styles.table,
                                {
                                  borderColor:
                                    mode === "light"
                                      ? light.textDark
                                      : dark.textWhite,
                                  width: SCREEN_WIDTH / 2.7,
                                },
                              ]}
                            >
                              <TextStyle
                                smallParagraph
                                color={
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite
                                }
                              >
                                {item.name}
                              </TextStyle>
                            </View>
                            <View
                              style={[
                                styles.table,
                                {
                                  borderColor:
                                    mode === "light"
                                      ? light.textDark
                                      : dark.textWhite,
                                  width: SCREEN_WIDTH / 2.7,
                                },
                              ]}
                            >
                              <TextStyle
                                smallParagraph
                                color={
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite
                                }
                              >
                                {thousandsSystem(item.value)}
                              </TextStyle>
                            </View>
                          </View>
                        );
                      }}
                    />
                  </View>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor total:{" "}
                    <TextStyle color={light.main2}>
                      {!accommodationInformation ||
                        thousandsSystem(
                          accommodationInformation?.accommodation?.reduce(
                            (a, b) => a + b.value,
                            0
                          )
                        )}
                    </TextStyle>
                  </TextStyle>

                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Fecha de creación:{" "}
                    <TextStyle color={light.main2}>
                      {changeDate(
                        new Date(accommodationInformation?.creationDate)
                      )}
                    </TextStyle>
                  </TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Fecha de modificación:{" "}
                    <TextStyle color={light.main2}>
                      {changeDate(
                        new Date(accommodationInformation?.modificationDate)
                      )}
                    </TextStyle>
                  </TextStyle>
                </View>
              </View>
            </View>
            <View
              style={{
                width: SCREEN_WIDTH,
                alignItems: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      mode === "light" ? light.main4 : dark.main1,
                    height: "auto",
                  },
                ]}
              >
                <View>
                  <View style={styles.row}>
                    <TextStyle color={light.main2} bigSubtitle>
                      SELECCIONA
                    </TextStyle>
                    <TouchableOpacity
                      onPress={() => {
                        cleanDataAccommodation();
                        setModalVisibleAccommodation(
                          !modalVisibleAccommodation
                        );
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={getFontSize(28)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Elije el grupo para la acomodación
                  </TextStyle>
                </View>
                <View style={{ marginTop: 20 }}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {accommodationState.map((item) => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              "SELECCIÓN",
                              `¿Vas a elegir la acomodación ${item.name}?`,
                              [
                                {
                                  text: "No",
                                  style: "cancel",
                                },
                                {
                                  text: "Si",
                                  onPress: () => {
                                    setAccommodationSelected(item);
                                    setReservationValue("accommodation", item);
                                    cleanDataAccommodation();
                                    setModalVisibleAccommodation(
                                      !modalVisibleAccommodation
                                    );
                                  },
                                },
                              ],
                              { cancelable: true }
                            );
                          }}
                          key={item.id}
                          style={[
                            styles.row,
                            styles.accommodationCard,
                            {
                              width: "100%",
                              backgroundColor:
                                mode === "light" ? light.main5 : dark.main2,
                            },
                          ]}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setAccommodationInformation(item);
                                scrollViewAccommodationRef.current?.scrollTo({
                                  x: 0,
                                  animated: true,
                                });
                              }}
                            >
                              <Ionicons
                                name="information-circle"
                                color={light.main2}
                                size={getFontSize(23)}
                                style={{ marginRight: 5 }}
                              />
                            </TouchableOpacity>
                            <TextStyle
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {item.name.slice(0, 20)}
                              {item.name.length > 20 ? "..." : ""}
                            </TextStyle>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingAccommodation({ editing: true, item });
                              setAccommodation(item.accommodation);
                              setAccommodationName(item.name);
                              setAccommodationValue(
                                "accommodation",
                                item.accommodation
                              );
                              setAccommodationValue("name", item.name);
                              scrollViewAccommodationRef.current?.scrollTo({
                                x: SCREEN_WIDTH * 2,
                                animated: true,
                              });
                            }}
                          >
                            <Ionicons
                              name="create-outline"
                              color={light.main2}
                              size={getFontSize(23)}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <ButtonStyle
                    backgroundColor={light.main2}
                    style={[styles.row, { justifyContent: "center" }]}
                    onPress={() => {
                      scrollViewAccommodationRef.current?.scrollTo({
                        x: SCREEN_WIDTH * 2,
                        animated: true,
                      });
                    }}
                  >
                    <TextStyle>Crear acomodación</TextStyle>
                    <Ionicons
                      name="add-circle-outline"
                      color={light.textDark}
                      size={getFontSize(16)}
                      style={{ marginLeft: 10 }}
                    />
                  </ButtonStyle>
                </View>
              </View>
            </View>
            <View
              style={{
                width: SCREEN_WIDTH,
                alignItems: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      mode === "light" ? light.main4 : dark.main1,
                    height: "auto",
                  },
                ]}
              >
                <View>
                  <View style={styles.row}>
                    <TextStyle color={light.main2} bigSubtitle>
                      CREAR
                    </TextStyle>
                    <TouchableOpacity
                      onPress={() => {
                        cleanDataAccommodation();
                        scrollViewAccommodationRef.current?.scrollTo({
                          x: SCREEN_WIDTH,
                          animated: true,
                        });
                      }}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={getFontSize(28)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Rellena los campos para la acomodación
                  </TextStyle>
                </View>
                <View style={{ marginTop: 20 }}>
                  <InputStyle
                    placeholder="Nombre del grupo"
                    right={
                      accommodationName
                        ? () => (
                            <TextStyle color={light.main2}>Nombre</TextStyle>
                          )
                        : null
                    }
                    value={accommodationName}
                    onChangeText={(text) => {
                      setAccommodationName(text);
                      setAccommodationValue("name", text);
                    }}
                    maxLength={30}
                  />
                  {accommodationErrors.name?.type && (
                    <TextStyle verySmall color={light.main2}>
                      Escriba el nombre del grupo de la acomodación
                    </TextStyle>
                  )}
                  <ScrollView style={{ maxHeight: 200 }}>
                    {accommodation.map((item) => {
                      return (
                        <View
                          key={item.id}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <TextStyle
                            customStyle={[
                              styles.accommodationCard,
                              {
                                backgroundColor:
                                  mode === "light" ? light.main5 : dark.main2,
                              },
                            ]}
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                          >
                            {item.name.slice(0, 10)}
                            {item.name.length > 10 ? "..." : ""}
                          </TextStyle>
                          <TextStyle
                            customStyle={[
                              styles.accommodationCard,
                              {
                                backgroundColor:
                                  mode === "light" ? light.main5 : dark.main2,
                              },
                            ]}
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                          >
                            {thousandsSystem(item.value)}
                          </TextStyle>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                "Advertencia",
                                "¿Estás seguro de que quieres eliminar el elemento de la acomodación?",
                                [
                                  {
                                    text: "NO",
                                    style: "cancel",
                                  },
                                  {
                                    text: "SI",
                                    onPress: () => {
                                      const newAccommodation =
                                        accommodation.filter(
                                          (a) => a.id !== item.id
                                        );
                                      setAccommodation(newAccommodation);
                                      setAccommodationValue(
                                        "accommodation",
                                        newAccommodation
                                      );
                                    },
                                  },
                                ],
                                { cancelable: true }
                              );
                            }}
                          >
                            <Ionicons
                              name="close-circle"
                              color={light.main2}
                              size={getFontSize(32)}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <InputStyle
                        placeholder="Nombre"
                        value={accommodationElementName}
                        onChangeText={(text) => {
                          setAccommodationElementName(text);
                          setAccommodationElementValueForm("name", text);
                        }}
                        maxLength={50}
                        stylesContainer={{ width: SCREEN_WIDTH / 3.2 }}
                      />
                      {accommodationElementErrors.name?.type && (
                        <TextStyle verySmall color={light.main2}>
                          Nombre requerido
                        </TextStyle>
                      )}
                    </View>
                    <View>
                      <InputStyle
                        placeholder="Valor"
                        value={thousandsSystem(accommodationElementValue)}
                        onChangeText={(text) => {
                          setAccommodationElementValue(
                            parseInt(text.replace(/[^0-9]/g, ""))
                          );
                          setAccommodationElementValueForm(
                            "value",
                            parseInt(text.replace(/[^0-9]/g, ""))
                          );
                        }}
                        keyboardType="numeric"
                        maxLength={11}
                        stylesContainer={{ width: SCREEN_WIDTH / 3.2 }}
                      />
                      {accommodationElementErrors.value?.type && (
                        <TextStyle verySmall color={light.main2}>
                          Valor requerido
                        </TextStyle>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={handleAccommodationElementSubmit(
                        saveAccommodationElement
                      )}
                    >
                      <Ionicons
                        name="add-circle"
                        color={light.main2}
                        size={getFontSize(32)}
                      />
                    </TouchableOpacity>
                  </View>
                  {accommodationErrors.accommodation?.type && (
                    <TextStyle verySmall color={light.main2}>
                      {accommodationErrors.accommodation.message}
                    </TextStyle>
                  )}
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                    customStyle={{ marginVertical: 10 }}
                  >
                    Total:{" "}
                    <TextStyle color={light.main2}>
                      {thousandsSystem(
                        accommodation.reduce((a, b) => a + b.value, 0)
                      )}
                    </TextStyle>
                  </TextStyle>

                  {editingAccommodation.editing && (
                    <ButtonStyle
                      onPress={() => deleteAccommodation()}
                      backgroundColor={
                        mode === "light" ? light.main5 : dark.main2
                      }
                    >
                      <TextStyle
                        center
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Eliminar
                      </TextStyle>
                    </ButtonStyle>
                  )}
                  <ButtonStyle
                    backgroundColor={light.main2}
                    onPress={handleAccommodationSubmit(
                      editingAccommodation.editing
                        ? updateAccommodation
                        : saveAccommodation
                    )}
                  >
                    <TextStyle center>
                      {editingAccommodation.editing ? "Actualizar" : "Guardar"}
                    </TextStyle>
                  </ButtonStyle>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  card: {
    width: "90%",
    height: 460,
    borderRadius: 8,
    padding: 30,
    justifyContent: "space-between",
  },
  accommodationCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    width: SCREEN_WIDTH / 3.2,
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default CreateReserve;
