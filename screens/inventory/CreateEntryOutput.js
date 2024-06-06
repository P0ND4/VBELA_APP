import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Alert,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import { Picker } from "@react-native-picker/picker";
import {
  thousandsSystem,
  convertThousandsSystem,
  random,
  getFontSize,
  calendarTheme,
} from "@helpers/libs";
import { edit } from "@features/inventory/informationSlice";
import { editInventory } from "@api";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import PaymentButtons from "@components/PaymentButtons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();

const CreateEntryOutput = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const helperStatus = useSelector((state) => state.helperStatus);
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const inventory = useSelector((state) => state.inventory);
  const suppliers = useSelector((state) => state.suppliers);

  const supplier = route.params?.supplier;
  const type = route.params.type;
  const item = route.params.item;
  const editing = route.params.editing;

  const [loading, setLoading] = useState(false);
  const [element, setElement] = useState(editing ? item.element : "");
  const [quantity, setQuantity] = useState(editing ? thousandsSystem(item.quantity) : "");
  const [elementValue, setElementValue] = useState(editing ? thousandsSystem(item.currentValue) : "");
  const [elementName, setElementName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(editing ? item.paymentMethod : "");

  const [lastValue, setLastValue] = useState(null);

  const [supplierSelected, setSupplierSelected] = useState(editing ? item.supplier : supplier || null);
  const [supplierOptions, setSupplierOptions] = useState([]);

  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const pickerElementRef = useRef();
  const pickerSupplierRef = useRef();
  const dispatch = useDispatch();

  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);
  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    if (editing) setElementName(inventory.find((i) => i.id === item.element).name);
  }, [editing, inventory, item]);

  useEffect(() => {
    (() => {
      if (!element) return setLastValue(null);
      const editable = inventory.find((i) => i.id === element);
      setLastValue(editable.currentValue);
    })();
  }, [element, inventory]);

  useEffect(() => setSupplierOptions(suppliers), [suppliers]);

  useEffect(() => {
    navigation.setOptions({
      title: type === "entry" ? "Entrada" : "Salida",
    });
  }, []);

  useEffect(() => {
    register("supplier", { value: editing ? item.supplier : supplier || null });
    register("date", {
      value: editing ? item.date : new Date(moment().format("YYYY-MM-DD")).getTime(),
      required: true,
    });
    register("paymentMethod", { value: "", required: !editing });
    register("element", { value: editing ? item.element : "", required: true });
    register("quantity", {
      value: editing ? item.quantity : "",
      required: true,
      validate: (value) => value > 0 || "Elija un monto mayor a 0",
    });
    register("value", { value: editing ? item.currentValue : "" });
  }, []);

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const editable = { ...inventory.find((i) => i.id === data.element) };
    editable[type] = [...editable[type]].map((e) => {
      if (e.id === item.id) {
        const editable = { ...e };
        editable.supplier = data.supplier;
        editable.date = data.date;
        return editable;
      }
      return e;
    });

    editable.modificationDate = new Date().getTime();
    dispatch(edit({ id: editable.id, data: editable }));
    navigation.pop();
    await editInventory({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      inventory: editable,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    const editable = { ...inventory.find((i) => i.id === data.element) };
    if (editable[type]?.find((i) => i.id === id)) onSubmitCreate(data);
    else {
      const method = [];
      if (data.paymentMethod !== "credit") {
        method.push({
          id: random(6),
          method: data.paymentMethod,
          total: data.value * data.quantity,
          quantity: data.quantity,
        });
      }

      const obj = {
        id,
        supplier: data.supplier,
        date: data.date,
        quantity: data.quantity,
        creationDate: new Date().getTime(),
        modificationDate: new Date().getTime(),
        currentValue: data.value || editable.currentValue,
        status: data.paymentMethod === "credit" ? "credit" : "paid",
        method,
        element: data.element,
      };
      if (type === "entry") {
        obj.entry = true;
        obj.lastValue = editable.currentValue;
      }
      editable[type] = [...editable[type], obj];
      editable.currentValue = data.value || editable.currentValue;
      editable.modificationDate = new Date().getTime();
      dispatch(edit({ id: editable.id, data: editable }));
      navigation.pop();
      await editInventory({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        inventory: editable,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  const deleteEntryOutput = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar la ${type === "entry" ? "entrada" : "salida"} de unidad?`,
      "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            setLoading(true);
            const editable = {
              ...inventory.find((i) => i.id === item.element),
            };
            editable[type] = editable[type].filter((e) => e.id !== item.id);
            dispatch(edit({ id: item.element, data: editable }));
            navigation.pop();
            await editInventory({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              inventory: editable,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
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
              <TextStyle bigParagraph center color={mode === "light" ? null : dark.textWhite}>
                Crear {type === "entry" ? "entrada" : "salida"}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 10 }}>
              {editing && (
                <TextStyle color={textColor}>
                  Elemento:{" "}
                  <TextStyle color={light.main2} style={{ marginVertical: 10 }}>
                    {elementName}
                  </TextStyle>
                </TextStyle>
              )}
              {lastValue && type === "entry" && (
                <TextStyle color={textColor}>
                  Valor anterior:{" "}
                  <TextStyle color={light.main2} style={{ marginVertical: 10 }}>
                    {thousandsSystem(lastValue || 0)}
                  </TextStyle>
                </TextStyle>
              )}
              <View>
                <ButtonStyle
                  backgroundColor={backgroundColor}
                  onPress={() => pickerSupplierRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle color={supplierSelected ? textColor : "#888888"}>
                      {suppliers.find((s) => s.id === supplierSelected)?.name ||
                        "SELECCIONE EL PROVEEDOR"}
                    </TextStyle>
                    <Ionicons
                      color={supplierSelected ? textColor : "#888888"}
                      size={getFontSize(15)}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>
                <View style={{ display: "none" }}>
                  <Picker
                    ref={pickerSupplierRef}
                    style={{ color: textColor }}
                    selectedValue={supplierSelected}
                    onValueChange={(value) => {
                      setValue("supplier", value);
                      setSupplierSelected(value);
                    }}
                  >
                    <Picker.Item
                      label="SELECCIONE EL PROVEEDOR"
                      value=""
                      style={{ backgroundColor }}
                      color={textColor}
                    />
                    {supplierOptions.map((s) => (
                      <Picker.Item
                        key={s.id}
                        label={s.name}
                        value={s.id}
                        style={{ backgroundColor }}
                        color={textColor}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {!editing && (
                <View>
                  <ButtonStyle
                    backgroundColor={backgroundColor}
                    onPress={() => pickerElementRef.current?.focus()}
                  >
                    <View style={styles.row}>
                      <TextStyle color={element ? textColor : "#888888"}>
                        {inventory.find((u) => u.id === element)?.name || "SELECCIONE EL ELEMENTO"}
                      </TextStyle>
                      <Ionicons
                        color={element ? textColor : "#888888"}
                        size={getFontSize(15)}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                  <View style={{ display: "none" }}>
                    <Picker
                      ref={pickerElementRef}
                      style={{ color: textColor }}
                      selectedValue={element}
                      onValueChange={(value) => {
                        setValue("element", value);
                        setElement(value);
                      }}
                    >
                      <Picker.Item
                        label="SELECCIONE EL ELEMENTO"
                        value=""
                        style={{ backgroundColor }}
                        color={textColor}
                      />
                      {inventory.map((i) => (
                        <Picker.Item
                          key={i.id}
                          label={i.name}
                          value={i.id}
                          style={{ backgroundColor }}
                          color={textColor}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
              {errors.element?.type && (
                <TextStyle verySmall color={light.main2}>
                  Seleccione el elemento
                </TextStyle>
              )}
              {!editing && (
                <InputStyle
                  value={quantity}
                  right={quantity ? () => <TextStyle color={light.main2}>Cantidad</TextStyle> : null}
                  placeholder="Cantidad"
                  keyboardType="numeric"
                  maxLength={9}
                  onChangeText={(num) => {
                    const converted = convertThousandsSystem(num);
                    setValue("quantity", +converted);
                    setQuantity(thousandsSystem(converted));
                  }}
                />
              )}
              {errors.quantity?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.quantity.type === "required"
                    ? "La cantidad de elementos es obligatorio"
                    : errors.quantity.message}
                </TextStyle>
              )}
              {type === "entry" && (
                <InputStyle
                  value={elementValue}
                  right={elementValue ? () => <TextStyle color={light.main2}>Valor</TextStyle> : null}
                  placeholder="Precio por unidad"
                  keyboardType="numeric"
                  maxLength={12}
                  onChangeText={(text) => {
                    setValue("value", parseInt(text.replace(/[^0-9]/g, "")));
                    setElementValue(thousandsSystem(text.replace(/[^0-9]/g, "")));
                  }}
                />
              )}
              <ButtonStyle
                backgroundColor={backgroundColor}
                onPress={() => setDateModalVisible(!dateModalVisible)}
              >
                <TextStyle color={textColor}>
                  Fecha de la {type === "entry" ? "entrada: " : "salida: "}
                  {date}
                </TextStyle>
              </ButtonStyle>
              {!editing && (
                <PaymentButtons
                  type={supplierSelected ? "credit" : "others"}
                  value={paymentMethod}
                  setValue={(method) => {
                    const value = method === paymentMethod ? "" : method;
                    setPaymentMethod(value);
                    setValue("paymentMethod", value);
                  }}
                />
              )}
              {errors.paymentMethod?.type && (
                <TextStyle verySmall color={light.main2}>
                  El método de pago es requerido
                </TextStyle>
              )}
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteEntryOutput();
                }}
                backgroundColor={backgroundColor}
              >
                <TextStyle center color={textColor}>
                  Eliminar
                </TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              onPress={handleSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
              backgroundColor={light.main2}
            >
              <TextStyle center>{editing ? "Guardar" : "Crear"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        animationType="fade"
        statusBarTranslucent={false}
        transparent={true}
        visible={dateModalVisible}
        onRequestClose={() => setDateModalVisible(!dateModalVisible)}
      >
        <TouchableWithoutFeedback onPress={() => setDateModalVisible(!dateModalVisible)}>
          <View style={[{ backgroundColor: "#0004" }, StyleSheet.absoluteFillObject]} />
        </TouchableWithoutFeedback>
        <View style={styles.centeredView}>
          <View
            style={[{ backgroundColor: mode === "light" ? light.main4 : dark.main2 }, styles.default]}
          >
            <Calendar
              style={{ borderRadius: 8 }}
              // Specify theme properties to override specific styles for calendar parts. Default = {}
              theme={calendarTheme(mode)}
              maxDate="2024-12-31"
              minDate="2023-01-01"
              firstDay={1}
              displayLoadingIndicator={false} // ESTA COOL
              enableSwipeMonths={true}
              onDayPress={(data) => {
                setDate(data.dateString);
                setValue("date", new Date(data.dateString).getTime());
                setDateModalVisible(!dateModalVisible);
              }}
              arrowsHitSlop={10}
              markedDates={{
                [date]: { selected: true, disableTouchEvent: true, selectedDotColor: light.main2 },
              }}
            />
          </View>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  default: {
    width: "80%",
    borderRadius: 8,
    padding: 15,
  },
});

export default CreateEntryOutput;
