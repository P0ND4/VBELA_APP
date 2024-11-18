import { useState, useEffect, useRef, useMemo } from "react";
import { View, KeyboardAvoidingView, ScrollView, Keyboard, Alert, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import { thousandsSystem, random } from "@helpers/libs";
import { add, edit, remove } from "@features/inventory/informationSlice";
import { change as CRecipe } from "@features/sales/recipesSlice";
import { addInventory, editInventory, editUser } from "@api";
import Ionicons from "@expo/vector-icons/Ionicons";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();

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
  const helperStatus = useSelector((state) => state.helperStatus);
  const inventory = useSelector((state) => state.inventory);
  const recipes = useSelector((state) => state.recipes);

  const element = route.params?.item;
  const editing = route.params?.editing;
  const defaultValue = route.params?.defaultValue;
  const onSend = route.params?.onSend;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editing ? element.name : defaultValue?.name || "");
  const [unit, setUnit] = useState(editing ? element.unit : defaultValue?.unit || "");
  const [visible, setVisible] = useState(editing ? element.visible : defaultValue?.visible || "both");
  const [reorder, setReorder] = useState(
    editing ? thousandsSystem(element.reorder || "") : thousandsSystem(defaultValue?.reorder || "")
  );
  const [reference, setReference] = useState(editing ? element.reference : "");
  const [brand, setBrand] = useState(editing ? element.brand : "");

  // const [quantity, setQuantity] = useState(
  //   editing ? thousandsSystem(element.entry.find((e) => !e.entry)?.quantity || 0) : ""
  // );
  const [elementValue, setElementValue] = useState(
    editing ? thousandsSystem(element.currentValue) : thousandsSystem(defaultValue?.value || "")
  );

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  const dispatch = useDispatch();
  const pickerUnitRef = useRef();
  const pickerVisibleRef = useRef();

  useEffect(() => {
    navigation.setOptions({ title: `${editing ? "Editar" : "Crear"} elemento` });
  }, [editing]);

  useEffect(() => {
    register("name", {
      value: editing ? element.name : defaultValue?.name || "",
      required: true,
      validate: {
        exists: (name) => {
          const exists = inventory.find(
            (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
          );

          return (
            (!editing || !exists
              ? !exists
              : element.name.trim().toLowerCase() === name.trim().toLowerCase()) ||
            "El elemento ya existe"
          );
        },
      },
    });
    register("unit", { value: editing ? element.unit : defaultValue?.unit || "", required: true });
    register("visible", { value: editing ? element.visible : defaultValue?.visible || "both" });
    register("reorder", { value: editing ? element.reorder : defaultValue?.reorder || 0 });
    register("reference", { value: editing ? element.reference : "" });
    register("brand", { value: editing ? element.brand : "" });
    register("currentValue", {
      value: editing ? element.currentValue : defaultValue?.value || "",
      required: true,
    });
  }, []);

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    // const quantityReference = parseInt(quantity?.replace(/[^0-9]/g, "")) || 0;
    // data.entry = element.entry.map((e) => {
    //   if (!e.entry) {
    //     const editable = { ...e };
    //     editable.quantity = quantityReference;
    //     editable.currentValue = data.currentValue;
    //     return editable;
    //   }
    //   return e;
    // });
    data.id = element.id;
    data.entry = element.entry;
    data.output = element.output;
    data.creationDate = element.creationDate;
    data.modificationDate = new Date().getTime();
    dispatch(edit({ id: data.id, data }));
    navigation.pop();
    await editInventory({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      inventory: data,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (inventory.find((i) => i.id === id)) onSubmitCreate(data);
    else {
      // const quantityReference = parseInt(quantity?.replace(/[^0-9]/g, "")) || 0;
      // data.entry = [
      //   {
      //     id: random(20),
      //     element: id,
      //     quantity: quantityReference,
      //     currentValue: data.currentValue,
      //     entry: false,
      //     creationDate: new Date().getTime(),
      //   },
      // ];
      data.id = id;
      data.entry = [];
      data.output = [];
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addInventory({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        inventory: data,
        helpers: helperStatus.active ? [helperStatus.id] : helpers.map((h) => h.id),
      });
    }
  };

  const deleteInventory = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar el elemento?`,
      "No podrá recuperar esta información una vez borrada, este elemento también será eliminado de receta/reconteo",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const newRecipes = recipes.map((r) => ({
              ...r,
              ingredients: r.ingredients.filter((i) => i.id !== element.id),
            }));

            setLoading(true);
            dispatch(CRecipe(newRecipes));
            dispatch(remove({ id: element.id }));
            navigation.pop();

            await editUser({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              change: {
                inventory: inventory.filter((i) => i.id !== element.id),
                recipes: newRecipes,
              },
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
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

  const visibleOptions = [
    { label: "VISIBLE PARA VENTAS (por defecto)", value: "both" },
    { label: "Restaurante/Bar", value: "menu" },
    { label: "Productos&Servicios", value: "sales" },
    { label: "Ninguno", value: "none" },
  ];

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
                {editing ? "Editar" : "Crear"} elemento
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                value={name}
                right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                placeholder="Nombre"
                maxLength={20}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
              />
              {errors.name?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.name.type === "required" ? "El nombre es obligatorio" : errors.name.message}
                </TextStyle>
              )}
              <View>
                <ButtonStyle
                  backgroundColor={backgroundColor}
                  onPress={() => pickerUnitRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle color={unit ? textColor : "#888888"}>
                      {unitOptions.find((u) => u.value === unit)?.label}
                    </TextStyle>
                    <Ionicons
                      color={unit ? textColor : "#888888"}
                      size={20}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>

                <View style={{ display: "none" }}>
                  <Picker
                    ref={pickerUnitRef}
                    style={{ color: textColor }}
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
                        style={{ backgroundColor }}
                        color={textColor}
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
              <View>
                <ButtonStyle
                  backgroundColor={backgroundColor}
                  onPress={() => pickerVisibleRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle color={visible !== "both" ? textColor : "#888888"}>
                      {visibleOptions.find((u) => u.value === visible)?.label}
                    </TextStyle>
                    <Ionicons
                      color={visible !== "both" ? textColor : "#888888"}
                      size={20}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>

                <View style={{ display: "none" }}>
                  <Picker
                    ref={pickerVisibleRef}
                    style={{ color: textColor }}
                    selectedValue={visible}
                    onValueChange={(value) => {
                      setValue("visible", value);
                      setVisible(value);
                      if (value !== "none") {
                        setValue("reorder", 0);
                        setReorder("");
                        // setQuantity("");
                      }
                    }}
                  >
                    {visibleOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
                        style={{ backgroundColor }}
                        color={textColor}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {/* <InputStyle
                value={quantity}
                right={quantity ? () => <TextStyle color={light.main2}>Cantidad</TextStyle> : null}
                placeholder="Cantidad en inventario"
                keyboardType="numeric"
                maxLength={9}
                onChangeText={(text) => setQuantity(thousandsSystem(text.replace(/[^0-9]/g, "")))}
              /> */}
              <InputStyle
                value={reorder}
                right={
                  reorder ? () => <TextStyle color={light.main2}>Punto de reorden</TextStyle> : null
                }
                placeholder="Punto de reorden"
                keyboardType="numeric"
                maxLength={9}
                onChangeText={(text) => {
                  if (text === "") setValue("reorder", 0);
                  else setValue("reorder", parseInt(text.replace(/[^0-9]/g, "")));
                  setReorder(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
              <InputStyle
                value={elementValue}
                right={elementValue ? () => <TextStyle color={light.main2}>Valor</TextStyle> : null}
                placeholder="Valor por unidad"
                keyboardType="numeric"
                maxLength={12}
                onChangeText={(text) => {
                  if (text === "") setValue("currentValue", "");
                  else setValue("currentValue", parseInt(text.replace(/[^0-9]/g, "")));
                  setElementValue(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
              {errors.currentValue?.type && (
                <TextStyle verySmall color={light.main2}>
                  Digite el valor del elemento por unidad
                </TextStyle>
              )}
              <InputStyle
                value={reference}
                right={reference ? () => <TextStyle color={light.main2}>Referencia</TextStyle> : null}
                placeholder="Referencia"
                maxLength={20}
                onChangeText={(text) => {
                  setValue("reference", text);
                  setReference(text);
                }}
              />
              <InputStyle
                value={brand}
                right={brand ? () => <TextStyle color={light.main2}>Marca</TextStyle> : null}
                placeholder="Marca"
                maxLength={20}
                onChangeText={(text) => {
                  setValue("brand", text);
                  setBrand(text);
                }}
              />
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteInventory();
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
                if (onSend) onSend(data);
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CreateElement;
