import { useEffect, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import { Picker } from "@react-native-picker/picker";
import { thousandsSystem, random } from "@helpers/libs";
import { edit } from "@features/inventory/informationSlice";
import { editInventory } from "@api";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateEntryOutput = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const activeGroup = useSelector((state) => state.activeGroup);
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const inventory = useSelector((state) => state.inventory);

  const type = route.params.type;
  const item = route.params.item;
  const editing = route.params.editing;

  const [loading, setLoading] = useState(false);
  const [element, setElement] = useState(editing ? item.element : "");
  const [quantity, setQuantity] = useState(
    editing ? thousandsSystem(item.quantity) : ""
  );
  const [elementValue, setElementValue] = useState(
    editing ? thousandsSystem(item.currentValue) : ""
  );
  const [elementName, setElementName] = useState();

  const pickerRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (editing) {
      setElementName(inventory.find((i) => i.id === item.element).name);
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: type === "entry" ? "Entrada" : "Salida",
    });
  }, []);

  useEffect(() => {
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
        editable.quantity = data.quantity;
        editable.currentValue = data.value || editable.currentValue;
        return editable;
      }
      return e;
    });

    editable.modificationDate = new Date().getTime();
    dispatch(edit({ id: editable.id, data: editable }));
    navigation.pop();
    await editInventory({
      identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
      inventory: editable,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    const editable = { ...inventory.find((i) => i.id === data.element) };
    if (editable[type]?.find((i) => i.id === id)) onSubmitCreate(data);
    else {
      const obj = {
        id,
        quantity: data.quantity,
        creationDate: new Date().getTime(),
        currentValue: data.value || editable.currentValue,
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
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        inventory: editable,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  const deleteEntryOutput = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar la ${
        type === "entry" ? "entrada" : "salida"
      } de unidad?`,
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
              identifier: activeGroup.active
                ? activeGroup.identifier
                : user.identifier,
              inventory: editable,
              groups: activeGroup.active
                ? [activeGroup.id]
                : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Layout style={{ marginTop: 0, padding: 30 }}>
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
                Crear {type === "entry" ? "entrada" : "salida"}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 10 }}>
              {editing && (
                <TextStyle
                  color={light.main2}
                  customStyle={{ marginVertical: 10 }}
                >
                  Elemento: {elementName}
                </TextStyle>
              )}
              {!editing && (
                <View>
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
                          element
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                      >
                        {element
                          ? inventory.find((u) => u.id === element)?.name
                          : "SELECCIONE EL ELEMENTO"}
                      </TextStyle>
                      <Ionicons
                        color={
                          element
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        size={18}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                  <View style={{ display: "none" }}>
                    <Picker
                      ref={pickerRef}
                      style={{
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                      }}
                      selectedValue={element}
                      onValueChange={(value) => {
                        setValue("element", value);
                        setElement(value);
                      }}
                    >
                      <Picker.Item
                        label="SELECCIONE EL ELEMENTO"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {inventory.map((i) => (
                        <Picker.Item
                          key={i.id}
                          label={i.name}
                          value={i.id}
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
              )}
              {errors.element?.type && (
                <TextStyle verySmall color={light.main2}>
                  Seleccione el elemento
                </TextStyle>
              )}
              <InputStyle
                value={quantity}
                right={
                  quantity
                    ? () => <TextStyle color={light.main2}>Cantidad</TextStyle>
                    : null
                }
                placeholder="Cantidad"
                keyboardType="numeric"
                maxLength={9}
                onChangeText={(text) => {
                  setValue("quantity", parseInt(text.replace(/[^0-9]/g, "")));
                  setQuantity(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
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
                  right={
                    elementValue
                      ? () => <TextStyle color={light.main2}>Valor</TextStyle>
                      : null
                  }
                  placeholder="Valor por unidad"
                  keyboardType="numeric"
                  maxLength={12}
                  onChangeText={(text) => {
                    setValue("value", parseInt(text.replace(/[^0-9]/g, "")));
                    setElementValue(
                      thousandsSystem(text.replace(/[^0-9]/g, ""))
                    );
                  }}
                />
              )}
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteEntryOutput();
                }}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
              >
                <TextStyle
                  center
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
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
    </Layout>
  );
};

export default CreateEntryOutput;
