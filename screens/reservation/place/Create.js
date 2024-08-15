import { useEffect, useState, useRef } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { add, edit } from "@features/zones/nomenclaturesSlice";
import {
  random,
  thousandsSystem,
  changeDate,
} from "@helpers/libs";
import {
  add as addA,
  edit as editA,
  remove as removeA,
} from "@features/zones/accommodationOptionsSlice";
import {
  addNomenclature,
  editNomenclature,
  editAccommodation,
  addAccommodation,
  removeAccommodation,
} from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import { Picker } from "@react-native-picker/picker";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const CreatePlace = ({ route, navigation }) => {
  const {
    register: placeRegister,
    setValue: setPlaceValue,
    formState: { errors: placeErrors },
    handleSubmit: handlePlaceSubmit,
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
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const accommodationState = useSelector((state) => state.accommodationOptions);

  const scrollViewAccommodationRef = useRef();
  const pickerRef = useRef();
  const place = route.params?.item;
  const editing = route.params?.editing;

  const [loading, setLoading] = useState(false);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [type, setType] = useState(editing ? place.type : "");
  const [name, setName] = useState(editing ? place.name : "");
  const [amount, setAmount] = useState(
    editing ? thousandsSystem(place.value || "") : ""
  );
  const [people, setPeople] = useState(
    editing ? thousandsSystem(place.people || "") : ""
  );
  const [nomenclature, setNomenclature] = useState(
    editing ? place.nomenclature : ""
  );

  const [modalVisibleAccommodation, setModalVisibleAccommodation] =
    useState(false);

  //////////
  const [accommodationElementName, setAccommodationElementName] = useState("");
  const [accommodationElementValue, setAccommodationElementValue] =
    useState("");

  //////////
  const [accommodationInformation, setAccommodationInformation] =
    useState(null);
  const [accommodationName, setAccommodationName] = useState("");
  const [accommodationSelected, setAccommodationSelected] = useState(
    editing ? place.accommodation || [] : []
  );
  const [accommodation, setAccommodation] = useState([]);
  const [editingAccommodation, setEditingAccommodation] = useState({
    editing: false,
    item: null,
  });
  const [hosted, setHosted] = useState([]);

  useEffect(() => {
    if (place?.type === "standard")
      setHosted(standardReservations.filter((r) => r.id === place.id));
    if (place?.type === "accommodation")
      setHosted(accommodationReservations.filter((r) => r.ref === place.id));
  }, [place]);

  useEffect(() => {
    setNomenclatures(
      nomenclaturesState.filter((n) => n.ref === route.params.zoneID)
    );
  }, [nomenclaturesState]);

  useEffect(() => {
    placeRegister("nomenclature", {
      value: editing ? place.nomenclature : "",
      required: true,
      validate: {
        exists: (nomenclature) => {
          const exists = nomenclatures.find(
            (n) => n.nomenclature === nomenclature
          );

          return (
            (!editing || !exists
              ? !exists
              : place.nomenclature === nomenclature) ||
            "La nomenclatura ya existe"
          );
        },
      },
    });
    placeRegister("type", { value: editing ? place.type : "", required: true });
    placeRegister("name", { value: editing ? place.name : "" });
  }, []);

  const eventHandler = (value) => {
    const validation = (value) => editing && type === value;
    placeRegister("people", {
      value: validation("standard") ? place.people : null,
      validate: (num) => num !== 0 || "El número debe ser mayor a 0",
      required: value === "standard",
    });
    placeRegister("value", {
      value: validation("standard") ? place.value : "",
      required: value === "standard",
    });
    placeRegister("accommodation", {
      value: validation("accommodation") ? place?.accommodation : null,
      validate: (arr) => {
        const ref = arr || [];

        if (value === "accommodation") {
          return ref.length !== 0 || "Debe colocar la acomodación";
        }
      },
    });
  };

  useEffect(() => eventHandler(editing ? place.type : ""), []);

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

  const valueTypeOptions = [
    { label: "Acomodación libre compartida", value: "accommodation" },
    { label: "Acomodación, valor estándar", value: "standard" },
  ];

  const dispatch = useDispatch();

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.ref = place.ref;
    data.id = place.id;
    data.creationDate = place.creationDate;

    dispatch(edit({ id: place.id, data }));
    navigation.pop();
    await editNomenclature({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      nomenclature: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    const exists = nomenclatures.find((n) => n.id === id);
    if (exists) return onSubmitCreate(data);

    data.ref = route.params.zoneID;
    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    navigation.pop();
    await addNomenclature({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      nomenclature: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
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

  return (
    <Layout style={{ padding: 30 }}>
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
            <View>
              <TextStyle bigTitle center color={light.main2}>
                VBELA
              </TextStyle>
              <TextStyle
                bigParagraph
                center
                color={mode === "light" ? null : dark.textWhite}
              >
                Creación de espacios
              </TextStyle>
              {editing && (
                <TextStyle center color={light.main2}>
                  {place.type === "standard" ? "Estandar" : "Acomodación"}
                </TextStyle>
              )}
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                placeholder="Nomenclatura"
                maxLength={5}
                right={
                  nomenclature
                    ? () => (
                        <TextStyle color={light.main2}>Nomenclatura</TextStyle>
                      )
                    : null
                }
                value={nomenclature}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setPlaceValue("nomenclature", text);
                  setNomenclature(text.replace(/[^0-9]/g, ""));
                }}
              />
              {placeErrors.nomenclature?.type && (
                <TextStyle verySmall color={light.main2}>
                  {placeErrors.nomenclature.type === "required"
                    ? "Nomenclatura obligatorio"
                    : placeErrors.nomenclature.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Nombre"
                value={name}
                right={
                  name
                    ? () => <TextStyle color={light.main2}>Nombre</TextStyle>
                    : null
                }
                maxLength={20}
                onChangeText={(text) => {
                  setPlaceValue("name", text);
                  setName(text);
                }}
              />
              <View>
                {hosted.length > 0 && (
                  <TextStyle verySmall color={light.main2}>
                    Para cambiar el tipo la habitación tiene que estar vacia
                  </TextStyle>
                )}
                {(hosted.length === 0 || !editing) && (
                  <ButtonStyle
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
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
                          type
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                      >
                        {valueTypeOptions.find((v) => v.value === type)
                          ?.label || "SELECCIONE EL TIPO DE VALOR"}
                      </TextStyle>
                      <Ionicons
                        color={
                          type
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        size={20}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                )}
                {placeErrors.type?.type && (
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
                    selectedValue={type}
                    onValueChange={(value) => {
                      setType(value);
                      const validation = (type) => editing && value === type;
                      setPeople(
                        validation("standard")
                          ? thousandsSystem(place.people || "")
                          : null
                      );
                      setAmount(
                        validation("standard")
                          ? thousandsSystem(place.value || "")
                          : ""
                      );
                      setPlaceValue("type", value);
                      setAccommodationSelected(
                        validation("accommodation")
                          ? place?.accommodation || []
                          : []
                      );
                      eventHandler(value);
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
              {type === "accommodation" && (
                <>
                  <ButtonStyle
                    backgroundColor={light.main2}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() =>
                      setModalVisibleAccommodation(!modalVisibleAccommodation)
                    }
                  >
                    <TextStyle>
                      {accommodationSelected.length > 0
                        ? `(${accommodationSelected.length}) Acomodaciones seleccionadas`
                        : "Agregar acomodación"}
                    </TextStyle>
                    <Ionicons
                      name="bed-outline"
                      color={light.textDark}
                      size={20}
                      style={{ marginLeft: 10 }}
                    />
                  </ButtonStyle>
                  {placeErrors.accommodation?.type && (
                    <TextStyle verySmall color={light.main2}>
                      {placeErrors.accommodation.message}
                    </TextStyle>
                  )}
                </>
              )}
              {type === "standard" && (
                <>
                  <InputStyle
                    value={amount}
                    right={
                      amount
                        ? () => <TextStyle color={light.main2}>Valor</TextStyle>
                        : null
                    }
                    keyboardType="numeric"
                    placeholder="Valor de la habitación (Por Día)"
                    onChangeText={(text) => {
                      setPlaceValue(
                        "value",
                        parseInt(text.replace(/[^0-9]/g, "")) || ""
                      );
                      setAmount(thousandsSystem(text.replace(/[^0-9]/g, "")));
                    }}
                    maxLength={10}
                  />
                  {placeErrors.value?.type && (
                    <TextStyle verySmall color={light.main2}>
                      Valor obligatorio
                    </TextStyle>
                  )}
                </>
              )}
              {type === "standard" && (
                <>
                  <InputStyle
                    value={people}
                    right={
                      people
                        ? () => (
                            <TextStyle color={light.main2}>Personas</TextStyle>
                          )
                        : null
                    }
                    keyboardType="numeric"
                    placeholder="Capacidad de habitación"
                    onChangeText={(text) => {
                      setPlaceValue(
                        "people",
                        parseInt(text.replace(/[^0-9]/g, "")) || ""
                      );
                      setPeople(text.replace(/[^0-9]/g, ""));
                    }}
                    maxLength={3}
                  />
                  {placeErrors.people?.type && (
                    <TextStyle verySmall color={light.main2}>
                      Digité la cantidad de persona máxima que acepta la
                      habitación
                    </TextStyle>
                  )}
                </>
              )}
              {type === "accommodation" && (
                <TextStyle
                  style={{ marginTop: 10 }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Valor por persona:{" "}
                  <TextStyle color={light.main2} smallSubtitle>
                    {thousandsSystem(
                      accommodationSelected?.reduce(
                        (a, b) => a + b.accommodation.reduce((a,b) => a + b.value, 0),
                        0
                      ) || 0
                    )}
                  </TextStyle>
                </TextStyle>
              )}
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={handlePlaceSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
            >
              <TextStyle center>{editing ? "Guardar" : "Crear"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
                        size={32}
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
                        size={32}
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
                      const exists = accommodationSelected.find(
                        (a) => a.id === item.id
                      );

                      return (
                        <TouchableOpacity
                          onPress={() => {
                            if (exists) return;

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
                                    const value = [...accommodationSelected, item]
                                    setAccommodationSelected(value);
                                    setPlaceValue("accommodation", value);
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
                                size={27}
                                style={{ marginRight: 5 }}
                              />
                            </TouchableOpacity>
                            <TextStyle
                              color={
                                exists
                                  ? light.main2
                                  : mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {item.name.slice(0, 20)}
                              {item.name.length > 20 ? "..." : ""}
                            </TextStyle>
                          </View>
                          {exists && (
                            <TouchableOpacity onPress={() => {
                              const value = accommodationSelected.filter(a => a.id !== item.id);
                              setAccommodationSelected(value);
                              setPlaceValue("accommodation", value);
                            }}>
                              <Ionicons
                                name="close"
                                color={light.main2}
                                size={29}
                                style={{ marginHorizontal: 5 }}
                              />
                            </TouchableOpacity>
                          )}
                          {!exists && (
                            <TouchableOpacity
                              onPress={() => {
                                setEditingAccommodation({
                                  editing: true,
                                  item,
                                });
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
                                size={29}
                                style={{ marginHorizontal: 5 }}
                              />
                            </TouchableOpacity>
                          )}
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
                      size={21}
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
                        size={32}
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
                            style={[
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
                            style={[
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
                              size={36}
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
                            parseInt(text.replace(/[^0-9]/g, "")) || ""
                          );
                          setAccommodationElementValueForm(
                            "value",
                            parseInt(text.replace(/[^0-9]/g, "")) || null
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
                        size={36}
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
                    style={{ marginVertical: 10 }}
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

export default CreatePlace;
