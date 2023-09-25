import { useState, useEffect, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import { thousandsSystem, random } from "@helpers/libs";
import { add, edit, remove } from "@features/inventory/informationSlice";
import { addInventory, editInventory, removeInventory } from "@api";
import Ionicons from "@expo/vector-icons/Ionicons";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateElement = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const user = useSelector((state) => state.user);
  const helpers = useSelector((state) => state.helpers);
  const mode = useSelector((state) => state.mode);
  const activeGroup = useSelector((state) => state.activeGroup);
  const inventory = useSelector((state) => state.inventory);

  const element = route.params?.item;
  const editing = route.params?.editing;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editing ? element.name : "");
  const [unit, setUnit] = useState(editing ? element.unit : "");
  const [reorder, setReorder] = useState(
    editing ? thousandsSystem(element.reorder || 0) : ""
  );
  const [quantity, setQuantity] = useState(
    editing
      ? thousandsSystem(element.entry.find((e) => !e.entry)?.quantity || 0)
      : ""
  );
  const [elementValue, setElementValue] = useState(
    editing ? thousandsSystem(element.currentValue) : ""
  );

  const dispatch = useDispatch();
  const pickerRef = useRef();

  useEffect(() => {
    register("name", {
      value: editing ? element.name : "",
      required: true,
      validate: {
        exists: (name) => {
          const exists = inventory.find(
            (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
          );

          return (
            (!editing || !exists
              ? !exists
              : element.name.trim().toLowerCase() ===
                name.trim().toLowerCase()) || "El elemento ya existe"
          );
        },
      },
    });
    register("unit", { value: editing ? element.unit : "", required: true });
    register("reorder", { value: editing ? element.reorder : 0 });
    register("currentValue", {
      value: editing ? element.currentValue : "",
      required: true,
    });
  }, []);

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    data.id = element.id;
    const quantityReference = parseInt(quantity?.replace(/[^0-9]/g, "")) || 0;
    data.entry = element.entry.map((e) => {
      if (!e.entry) {
        const editable = { ...e };
        editable.quantity = quantityReference;
        editable.currentValue = data.currentValue;
        return editable;
      }
      return e;
    });
    data.output = element.output;
    data.creationDate = element.creationDate;
    data.modificationDate = new Date().getTime();
    dispatch(edit({ id: data.id, data }));
    navigation.pop();
    await editInventory({
      identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
      inventory: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (inventory.find((i) => i.id === id)) onSubmitCreate(data);
    else {
      const quantityReference = parseInt(quantity?.replace(/[^0-9]/g, "")) || 0;
      data.id = id;
      data.entry = [
        {
          id: random(20),
          element: id,
          quantity: quantityReference,
          currentValue: data.currentValue,
          entry: false,
          creationDate: new Date().getTime(),
        },
      ];
      data.output = [];
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addInventory({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        inventory: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : helpers.map((h) => h.id),
      });
    }
  };

  const deleteInventory = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar el elemento?`,
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
            dispatch(remove({ id: element.id }));
            navigation.pop();
            await removeInventory({
              identifier: activeGroup.active
                ? activeGroup.identifier
                : user.identifier,
              id: element.id,
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

  const unitOptions = [
    { label: "SELECCIONE LA UNIDAD", value: "" },
    { label: "Unidad", value: "UND" },
    { label: "Kilogramo", value: "KG" },
    { label: "Gramo", value: "G" },
    { label: "Miligramo", value: "MG" },
    { label: "Onza", value: "OZ" },
    { label: "Libra", value: "LB" },
    { label: "Litro", value: "L" },
    { label: "Mililitro", value: "ML" },
    { label: "Galón", value: "GAL" },
    { label: "Pinta", value: "PT" },
    { label: "Onza fluida", value: "FL OZ" },
  ];

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
                Crear elemento
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                value={name}
                right={
                  name
                    ? () => <TextStyle color={light.main2}>Nombre</TextStyle>
                    : null
                }
                placeholder="Nombre"
                maxLength={20}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
              />
              {errors.name?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.name.type === "required"
                    ? "El nombre es obligatorio"
                    : errors.name.message}
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
                        unit
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                    >
                      {unitOptions.find((u) => u.value === unit)?.label}
                    </TextStyle>
                    <Ionicons
                      color={
                        unit
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
                      color: mode === "light" ? light.textDark : dark.textWhite,
                    }}
                    selectedValue={unit}
                    onValueChange={(value) => {
                      setValue("unit", value);
                      setUnit(value);
                    }}
                  >
                    {unitOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
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
              {errors.unit?.type && (
                <TextStyle verySmall color={light.main2}>
                  Seleccione la unidad del elemento
                </TextStyle>
              )}
              <InputStyle
                value={quantity}
                right={
                  quantity
                    ? () => <TextStyle color={light.main2}>Cantidad</TextStyle>
                    : null
                }
                placeholder="Cantidad en inventario"
                keyboardType="numeric"
                maxLength={9}
                onChangeText={(text) =>
                  setQuantity(thousandsSystem(text.replace(/[^0-9]/g, "")))
                }
              />
              <InputStyle
                value={reorder}
                right={
                  reorder
                    ? () => (
                        <TextStyle color={light.main2}>
                          Punto de reorden
                        </TextStyle>
                      )
                    : null
                }
                placeholder="Punto de reorden"
                keyboardType="numeric"
                maxLength={9}
                onChangeText={(text) => {
                  if (text === "") setValue("reorder", 0);
                  else
                    setValue("reorder", parseInt(text.replace(/[^0-9]/g, "")));
                  setReorder(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
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
                  if (text === "") setValue("currentValue", "");
                  else
                    setValue(
                      "currentValue",
                      parseInt(text.replace(/[^0-9]/g, ""))
                    );
                  setElementValue(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
              {errors.currentValue?.type && (
                <TextStyle verySmall color={light.main2}>
                  Digite el valor del elemento por unidad
                </TextStyle>
              )}
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteInventory();
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

export default CreateElement;
