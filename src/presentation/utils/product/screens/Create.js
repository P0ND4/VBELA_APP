import { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { thousandsSystem, convertThousandsSystem } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import MultipleSelect from "@components/MultipleSelect";
import Ionicons from "@expo/vector-icons/Ionicons";
import FrontPage from "@utils/product/components/FrontPage";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const Create = ({ item, categoryOptions = [], onSubmit, onRemove, type }) => {
  const {
    watch,
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const mode = useSelector((state) => state.mode);
  const groups = useSelector((state) => state.groups);
  const recipes = useSelector((state) => state.recipes);
  const inventory = useSelector((state) => state.inventory);

  const [name, setName] = useState(item?.name || "");
  const [identifier, setIdentifier] = useState(item?.identifier || "");
  const [price, setPrice] = useState(item ? thousandsSystem(item.value) : "");
  const [purchase, setPurchase] = useState(item ? thousandsSystem(item.purchase) : "");
  const [unit, setUnit] = useState(item?.unit || "");
  const [quantity, setQuantity] = useState(item ? thousandsSystem(item.quantity || 0) : "");
  const [reorder, setReorder] = useState(item ? thousandsSystem(item.reorder || 0) : "");
  const [recipe, setRecipe] = useState(null);
  const [utility, setUtility] = useState(item ? item.value - item.purchase : 0);

  const [modalCategory, setModalCategory] = useState(false);
  const [modalSubcategory, setModalSubcategory] = useState(false);

  const [category, setCategory] = useState(item?.category || []);
  const [subcategory, setSubcategory] = useState(item?.subcategory || []);

  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  const [subcategoryDefault, setSubcategoryDefault] = useState([]);
  const [categoryDefault, setCategoryDefault] = useState([]);
  const [showInventory, setShowInventory] = useState(true);

  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);
  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const pickerRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    (() => {
      if (!item) return;
      const categories = groups.filter((g) => item.category.includes(g.id));
      const subcategories = categories
        .reduce((a, b) => [...a, ...b.subcategory], [])
        .map((s) => ({ ...s, name: s.subcategory }));

      setCategoryDefault(categories.map((c) => ({ ...c, name: c.category })));
      setSubcategoryDefault(subcategories.filter((s) => item.subcategory.includes(s.id)));

      setSubcategoryOptions(subcategories);
    })();
  }, [item]);

  useEffect(() => {
    setRecipe(recipes.find((r) => r.id === item?.recipe) || null);
  }, [item, recipes]);

  useEffect(() => {
    setUtility(price.replace(/[^0-9]/g, "") - purchase.replace(/[^0-9]/g, ""));
  }, [price, purchase]);

  useEffect(() => {
    register("name", { value: item?.name || "", required: true });
    register("identifier", { value: item?.identifier || "" });
    register("unit", { value: item?.unit || "", required: true });
    register("quantity", { value: item?.quantity || 0 });
    register("reorder", { value: item?.reorder || 0 });
    register("value", { value: item?.value || "", required: true });
    register("recipe", { value: item?.recipe || null });
    register("purchase", { value: item?.purchase || 0 });
    register("category", { value: item?.category || [] });
    register("subcategory", { value: item?.subcategory || [] });
  }, []);

  const unitOptions = [
    { label: "Seleccione", value: "" },
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
    <Layout>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flexGrow: 1, justifyContent: "space-between" }}>
            <TextStyle color={textColor}>
              Utilidad neta:{" "}
              <TextStyle color={utility < 0 ? "#F70000" : light.main2}>
                {thousandsSystem(utility)}
              </TextStyle>
            </TextStyle>
            <View style={{ alignItems: "center", marginVertical: 15 }}>
              <FrontPage
                containerStyle={[styles.card, { backgroundColor }]}
                name={name || "Nombre"}
                quantity={convertThousandsSystem(quantity) || "0"}
                reorder={convertThousandsSystem(reorder) || "0"}
                value={convertThousandsSystem(price) || "0"}
                unit={unit || "UNIDAD"}
                identifier={identifier}
                recipe={recipe?.name || ""}
              />
              {name && showInventory && (
                <ButtonStyle
                  backgroundColor="transparent"
                  style={{ borderWidth: 2, borderColor: light.main2, width: SCREEN_WIDTH / 3.5 }}
                  onPress={() => {
                    const { reorder, value } = watch();
                    navigation.navigate("CreateElement", {
                      defaultValue: {
                        name,
                        unit,
                        reorder,
                        value,
                        visible: type,
                      },
                      onSend: () => {
                        Alert.alert("CREADO", "Ha sido creado el elemento satisfactoriamente", [], {
                          cancelable: true,
                        });
                        setShowInventory(false);
                      },
                    });
                  }}
                >
                  <TextStyle center verySmall color={light.main2}>
                    Inventario
                  </TextStyle>
                </ButtonStyle>
              )}
            </View>
            <View>
              <View>
                <TextStyle color={textColor} smallParagraph>
                  Nombre del producto
                </TextStyle>
                <InputStyle
                  placeholder="Nombre"
                  value={name}
                  onChangeText={(text) => {
                    setValue("name", text);
                    setName(text);
                  }}
                  maxLength={32}
                />
                {errors.name?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El nombre es requerido
                  </TextStyle>
                )}
              </View>
              <View style={styles.row}>
                <View
                  style={{
                    width: !recipe ? SCREEN_WIDTH / 2.3 : "100%",
                    marginVertical: !recipe ? 2 : 0,
                  }}
                >
                  <TextStyle color={textColor} smallParagraph>
                    Identificador del producto
                  </TextStyle>
                  <InputStyle
                    value={identifier}
                    onChangeText={(text) => {
                      setValue("identifier", text);
                      setIdentifier(text);
                    }}
                    maxLength={16}
                    placeholder="Identificador"
                  />
                </View>
                {!recipe && (
                  <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                    <TextStyle color={textColor} smallParagraph>
                      Unidad del producto
                    </TextStyle>
                    <ButtonStyle
                      style={{ paddingHorizontal: 12 }}
                      backgroundColor={backgroundColor}
                      onPress={() => pickerRef.current?.focus()}
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
                    {errors.unit?.type && (
                      <TextStyle verySmall color={light.main2}>
                        Seleccione la unidad del elemento
                      </TextStyle>
                    )}
                    <View style={{ display: "none" }}>
                      <Picker
                        ref={pickerRef}
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
                )}
              </View>
              {!recipe && (
                <View style={styles.row}>
                  <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                    <TextStyle color={textColor} smallParagraph>
                      Cantidad en stock
                    </TextStyle>
                    <InputStyle
                      value={quantity}
                      keyboardType="numeric"
                      maxLength={9}
                      onChangeText={(text) => {
                        setQuantity(thousandsSystem(text.replace(/[^0-9]/g, "")));
                        if (text === "") setValue("quantity", 0);
                        else setValue("quantity", parseInt(text.replace(/[^0-9]/g, "")));
                      }}
                      placeholder="Cantidad"
                    />
                  </View>
                  <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                    <TextStyle color={textColor} smallParagraph>
                      Punto de reorden
                    </TextStyle>
                    <InputStyle
                      value={reorder}
                      keyboardType="numeric"
                      maxLength={9}
                      onChangeText={(text) => {
                        if (text === "") setValue("reorder", 0);
                        else setValue("reorder", parseInt(text.replace(/[^0-9]/g, "")));
                        setReorder(thousandsSystem(text.replace(/[^0-9]/g, "")));
                      }}
                      placeholder="Reorden"
                    />
                  </View>
                </View>
              )}
              {!recipe && (
                <View style={styles.row}>
                  <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                    <TextStyle color={textColor} smallParagraph>
                      Precio de venta
                    </TextStyle>
                    <InputStyle
                      value={price}
                      maxLength={15}
                      keyboardType="numeric"
                      onChangeText={(num) => {
                        if (num === "") setValue("value", "");
                        else setValue("value", parseInt(num.replace(/[^0-9]/g, "")));
                        setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
                      }}
                      placeholder="Venta"
                    />
                    {errors.value?.type && (
                      <TextStyle verySmall color={light.main2}>
                        El precio de venta es requerido
                      </TextStyle>
                    )}
                  </View>
                  <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                    <TextStyle color={textColor} smallParagraph>
                      Costo de producción
                    </TextStyle>
                    <InputStyle
                      value={purchase}
                      maxLength={15}
                      keyboardType="numeric"
                      onChangeText={(num) => {
                        if (num === "") setValue("purchase", 0);
                        else setValue("purchase", parseInt(num.replace(/[^0-9]/g, "")));
                        setPurchase(thousandsSystem(num.replace(/[^0-9]/g, "")));
                      }}
                      placeholder="Costo"
                    />
                  </View>
                </View>
              )}
              <ButtonStyle
                backgroundColor={light.main2}
                style={{ marginVertical: 10 }}
                onLongPress={() => {
                  if (!recipe) return;
                  Alert.alert(
                    "CONFIRMACIÓN",
                    `¿Desea remover ${type === "sales" ? "el reconteo" : "la receta"}?`,
                    [
                      {
                        text: "No estoy seguro",
                        style: "cancel",
                      },
                      {
                        text: "Estoy seguro",
                        onPress: () => {
                          setValue("unit", "");
                          setValue("value", "");
                          setValue("purchase", 0);
                          setValue("recipe", null);

                          setPrice("");
                          setPurchase("");
                          setUnit("");
                          setRecipe(null);
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
                onPress={() =>
                  navigation.navigate("Recipe", {
                    type,
                    onSelected: (recipe) => {
                      const purchase = recipe?.ingredients.reduce((a, b) => {
                        const element = inventory.find((e) => e.id === b.id);
                        return a + element?.currentValue * b.quantity;
                      }, 0);

                      setValue("unit", "UND");
                      setValue("value", recipe?.value);
                      setValue("purchase", purchase);
                      setValue("recipe", recipe.id);

                      setPurchase(thousandsSystem(purchase));
                      setPrice(thousandsSystem(recipe?.value));
                      setUnit("UND");
                      setRecipe(recipe);
                    },
                  })
                }
              >
                <TextStyle center>
                  {!recipe ? `Agregar ${type === "sales" ? "Reconteo" : "Receta"}` : recipe.name}
                </TextStyle>
              </ButtonStyle>
              <View style={styles.row}>
                <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                  <TextStyle color={textColor} smallParagraph>
                    Seleccionar categoría
                  </TextStyle>
                  <ButtonStyle
                    backgroundColor={backgroundColor}
                    onPress={() => setModalCategory(!modalCategory)}
                  >
                    <View style={styles.row}>
                      <TextStyle color={category.length ? textColor : "#888888"}>
                        Categorías {category.length ? `(${category.length})` : ""}
                      </TextStyle>
                      <Ionicons
                        color={category.length ? textColor : "#888888"}
                        size={20}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                </View>
                <View style={{ width: SCREEN_WIDTH / 2.3, marginVertical: 2 }}>
                  <TextStyle color={textColor} smallParagraph>
                    Seleccionar subcategorías
                  </TextStyle>
                  <ButtonStyle
                    backgroundColor={backgroundColor}
                    onPress={() => setModalSubcategory(!modalSubcategory)}
                  >
                    <View style={styles.row}>
                      <TextStyle color={subcategory.length ? textColor : "#888888"}>
                        Subcategorías {subcategory.length ? `(${subcategory.length})` : ""}
                      </TextStyle>
                      <Ionicons
                        color={subcategory.length ? textColor : "#888888"}
                        size={20}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                </View>
              </View>
            </View>
            <View>
              {item && (
                <ButtonStyle
                  backgroundColor="transparent"
                  style={{ borderWidth: 2, borderColor: light.main2 }}
                  onPress={() => onRemove()}
                >
                  <TextStyle center smallParagraph color={light.main2}>
                    Eliminar pedido
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor="transparent"
                style={{ borderWidth: 2, borderColor: light.main2 }}
                onPress={handleSubmit(onSubmit)}
              >
                <TextStyle center smallParagraph color={light.main2}>
                  {!item ? "Añadir producto" : "Guardar"}
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <MultipleSelect
        modalVisible={modalCategory}
        setModalVisible={setModalCategory}
        title="CATEGORÍAS"
        noItemsText="NO HAY CATEGORÍA"
        data={categoryOptions}
        onSubmit={(selected) => {
          const ids = selected.map((s) => s.id);
          const subcategories = selected
            .reduce((a, b) => [...a, ...b.subcategory], [])
            .map((s) => ({ ...s, name: s.subcategory }));

          const subcategoryUpdated = subcategory.filter((s) => subcategories.some((sb) => s === sb.id));

          setSubcategory(subcategoryUpdated);
          setValue("subcategory", subcategoryUpdated);
          setSubcategoryOptions(subcategories);
          setCategory(ids);
          setValue("category", ids);
        }}
        defaultValue={categoryDefault}
      />
      <MultipleSelect
        modalVisible={modalSubcategory}
        setModalVisible={setModalSubcategory}
        noItemsText="NO HAY SUB-CATEGORÍA"
        title="SUB-CATEGORÍAS"
        data={subcategoryOptions}
        onSubmit={(selected) => {
          const ids = selected.map((s) => s.id);
          setSubcategory(ids);
          setValue("subcategory", ids);
        }}
        defaultValue={subcategoryDefault}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    height: SCREEN_WIDTH / 3.5,
    width: SCREEN_WIDTH / 3.5,
    borderRadius: 5,
  },
});

export default Create;
