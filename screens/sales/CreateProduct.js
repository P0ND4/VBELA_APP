import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { add as addM, edit as editM, remove as removeM } from "@features/tables/menuSlice";
import { add as addP, edit as editP, remove as removeP } from "@features/sales/productsSlice";
import {
  addMenu,
  editMenu,
  removeMenu,
  addProduct,
  editProduct,
  removeProduct,
  removeRecipe,
} from "@api";
import { remove as removeR } from "@features/sales/recipesSlice";
import { thousandsSystem, random, getFontSize } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import MultipleSelect from "@components/MultipleSelect";
import Layout from "@components/Layout";
import Information from "@components/Information";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { light, dark } = theme();

const CreateProduct = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const editing = route.params?.editing;
  const item = route.params?.item;
  const sales = route.params?.sales;

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const menu = useSelector((state) => state.menu);
  const products = useSelector((state) => state.products);
  const groups = useSelector((state) => state.groups);
  const helperStatus = useSelector((state) => state.helperStatus);
  const recipes = useSelector((state) => state.recipes);

  const [name, setName] = useState(editing ? item.name : "");
  const [identifier, setIdentifier] = useState(editing ? item.identifier : "");
  const [price, setPrice] = useState(editing ? thousandsSystem(item.value) : "");
  const [purchase, setPurchase] = useState(editing ? thousandsSystem(item.purchase) : "");
  const [unit, setUnit] = useState(editing ? item.unit : "");
  const [quantity, setQuantity] = useState(editing ? thousandsSystem(item.quantity || 0) : "");
  const [reorder, setReorder] = useState(editing ? thousandsSystem(item.reorder || 0) : "");
  const [utility, setUtility] = useState(editing ? item.value - item.purchase : 0);

  const [subcategoryKey, setSubcategoryKey] = useState(Math.random());
  const [categoryKey, setCategoryKey] = useState(Math.random());

  const [recipeSelected, setRecipeSelected] = useState(editing ? item.recipe : null);
  const [modalVisibleRecipe, setModalVisibleRecipe] = useState(false);
  const [modalCategory, setModalCategory] = useState(false);
  const [modalSubcategory, setModalSubcategory] = useState(false);
  const [category, setCategory] = useState(editing ? item.category : []);
  const [recipeList, setRecipeList] = useState([]);
  const [subcategory, setSubcategory] = useState(editing ? item.subcategory : []);
  const [subcategoryOptions, setSubcategoryOptions] = useState(
    editing
      ? groups
          .filter((g) => item.category.includes(g.id))
          .map((o) => o.subcategory)
          .flat()
          .map((sub) => ({ ...sub, name: sub.subcategory }))
      : []
  );

  const dispatch = useDispatch();
  const pickerRef = useRef();

  const setSelection = route.params?.setSelection;
  const selection = route.params?.selection;

  useEffect(() => {
    setUtility(price.replace(/[^0-9]/g, "") - purchase.replace(/[^0-9]/g, ""));
  }, [price, purchase]);

  useEffect(() => {
    navigation.setOptions({
      title: sales ? "Nuevo producto/servicio" : "Nuevo menú",
    });
  }, []);

  useEffect(() => {
    const validation = (condition) => recipes.filter((r) => r.type === condition);
    if (sales) setRecipeList(validation("sales"));
    else setRecipeList(validation("menu"));
  }, [sales, recipes]);

  useEffect(() => {
    register("name", { value: editing ? item.name : "", required: true });
    register("identifier", { value: editing ? item.identifier : "" });
    register("unit", { value: editing ? item.unit : "", required: true });
    register("quantity", { value: editing ? item.quantity : 0 });
    register("reorder", { value: editing ? item.reorder : 0 });
    register("value", { value: editing ? item.value : "", required: true });
    register("recipe", { value: editing ? item.recipe : null });
    register("purchase", {
      value: editing ? item.purchase : "",
      required: true,
    });
    register("category", { value: editing ? item.category : [] });
    register("subcategory", { value: editing ? item.subcategory : [] });
  }, []);

  const onSubmitCreate = async (data) => {
    const id = random(20);
    if (menu.find((m) => m.id === id) && !sales) return onSubmitCreate(data);
    if (products.find((p) => p.id === id) && sales) return onSubmitCreate(data);
    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    if (sales) {
      dispatch(addP(data));
      navigation.pop();
      await addProduct({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        product: data,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    } else {
      dispatch(addM(data));
      navigation.pop();
      await addMenu({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        menu: data,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  const onSubmitEdit = async (data) => {
    data.id = item.id;
    data.group = null;
    data.creationDate = item.creationDate;
    data.modificationDate = new Date().getTime();

    setSelection(selection.filter((s) => s.id !== item.id));
    if (sales) {
      dispatch(editP({ id: item.id, data }));
      navigation.pop();
      await editProduct({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        product: data,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    } else {
      dispatch(editM({ id: item.id, data }));
      navigation.pop();
      await editMenu({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        menu: data,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  const onSubmitRemove = async () => {
    Alert.alert("Eliminar", "¿Esta seguro que desea eliminar el producto?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          setSelection(selection.filter((s) => s.id !== item.id));
          if (sales) {
            dispatch(removeP({ id: item.id }));
            navigation.pop();
            await removeProduct({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              id: item.id,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          } else {
            dispatch(removeM({ id: item.id }));
            navigation.pop();
            await removeMenu({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              id: item.id,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          }
        },
      },
    ]);
  };

  const Recipe = ({ item }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
      <>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "SELECCIÓN",
              `¿Vas a elegir la receta ${item.name}?`,
              [
                {
                  text: "No",
                  style: "cancel",
                },
                {
                  text: "Si",
                  onPress: () => {
                    setRecipeSelected(item);
                    setValue("recipe", item);
                    setModalVisibleRecipe(false);
                  },
                },
              ],
              { cancelable: true }
            );
          }}
          style={[
            styles.row,
            styles.recipeCard,
            {
              width: "100%",
              backgroundColor: mode === "light" ? light.main5 : dark.main2,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
              <Ionicons
                name="information-circle"
                color={light.main2}
                size={getFontSize(23)}
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
            <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
              {item.name.slice(0, 20)}
              {item.name.length > 20 ? "..." : ""}
            </TextStyle>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CreateRecipe", {
                  editing: true,
                  item,
                  sales,
                })
              }
            >
              <Ionicons name="create-outline" color={light.main2} size={getFontSize(23)} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "ELIMINAR",
                  `¿Estás seguro que desea eliminar la receta ${item.name}?`,
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Si",
                      onPress: async () => {
                        dispatch(removeR({ id: item?.id }));
                        await removeRecipe({
                          identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
                          id: item.id,
                          helpers: helperStatus.active
                            ? [helperStatus.id]
                            : user.helpers.map((h) => h.id),
                        });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Ionicons
                name="trash"
                color={light.main2}
                size={getFontSize(23)}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <Information
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          style={{
            backgroundColor: mode === "light" ? light.main4 : dark.main1,
          }}
          title="INFORMACIÓN"
          content={() => (
            <View>
              <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
                Ingredientes de ({item.name.toUpperCase()})
              </TextStyle>
              <FlatList
                data={item.ingredients}
                style={{ maxHeight: 400, marginTop: 15 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle smallParagraph color={light.main2}>
                      {thousandsSystem(item.portion || "0")} ({item.unit})
                    </TextStyle>
                    <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
                      {" "}
                      {item.name}
                    </TextStyle>
                  </View>
                )}
              />
            </View>
          )}
        />
      </>
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
    <Layout>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
            <TextStyle color={mode === "light" ? light.textDark : dark.textWhite} subtitle>
              Utilidad neta:{" "}
              <TextStyle subtitle color={utility < 0 ? "#F70000" : light.main2}>
                {utility < 0 ? "-" : ""}
                {thousandsSystem(Math.abs(utility))}
              </TextStyle>
            </TextStyle>
            <View style={{ alignItems: "center" }}>
              <View
                style={[
                  styles.catalogueCard,
                  {
                    marginVertical: 20,
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <View
                  style={{
                    height: "60%",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 14,
                  }}
                >
                  <TextStyle color={mode === "light" ? light.textDark : dark.textWhite} smallParagraph>
                    {!name ? "Nombre" : name}
                  </TextStyle>
                  <View style={{ flexDirection: "row" }}>
                    <TextStyle
                      verySmall
                      color={
                        parseInt(quantity ? quantity.replace(/[^0-9]/g, "") : 0) <
                        parseInt(reorder ? reorder.replace(/[^0-9]/g, "") : 0)
                          ? "#F70000"
                          : light.main2
                      }
                    >
                      {parseInt(quantity ? quantity.replace(/[^0-9]/g, "") : 0) < 0 ? "-" : ""}
                      {thousandsSystem(
                        Math.abs(parseInt(quantity ? quantity.replace(/[^0-9]/g, "") : 0))
                      )}
                      /
                    </TextStyle>
                    <TextStyle verySmall color={mode === "light" ? light.textDark : dark.textWhite}>
                      {reorder || 0}
                    </TextStyle>
                  </View>
                  {recipeSelected && (
                    <TextStyle verySmall color={mode === "light" ? light.textDark : dark.textWhite}>
                      {recipeSelected.name.length > 12
                        ? `${recipeSelected.name.slice(0, 12).toUpperCase()}...`
                        : recipeSelected.name.toUpperCase()}
                    </TextStyle>
                  )}
                </View>
                <View style={styles.footerCatalogue}>
                  <TextStyle verySmall>
                    {!identifier
                      ? "Identificador"
                      : identifier.length > 18
                      ? identifier.slice(0, 17) + "..."
                      : identifier}
                  </TextStyle>
                  <View style={[styles.row, { flexWrap: "wrap" }]}>
                    <TextStyle smallParagraph>{price || 0}</TextStyle>
                    <TextStyle verySmall>{unit}</TextStyle>
                  </View>
                </View>
              </View>
              <View style={{ width: "100%" }}>
                <InputStyle
                  value={name}
                  onChangeText={(text) => {
                    setValue("name", text);
                    setName(text);
                  }}
                  right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                  maxLength={16}
                  placeholder="Nombre del producto"
                />
                {errors.name?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El nombre es requerido
                  </TextStyle>
                )}
                <InputStyle
                  value={identifier}
                  right={
                    identifier ? () => <TextStyle color={light.main2}>Identificador</TextStyle> : null
                  }
                  onChangeText={(text) => {
                    setValue("identifier", text);
                    setIdentifier(text);
                  }}
                  maxLength={16}
                  placeholder="Identificador del producto"
                />
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
                        color={unit ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"}
                      >
                        {unitOptions.find((u) => u.value === unit)?.label}
                      </TextStyle>
                      <Ionicons
                        color={unit ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"}
                        size={getFontSize(15)}
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
                            backgroundColor: mode === "light" ? light.main5 : dark.main2,
                          }}
                          color={mode === "light" ? light.textDark : dark.textWhite}
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
                  right={quantity ? () => <TextStyle color={light.main2}>Cantidad</TextStyle> : null}
                  placeholder="Cantidad en stock"
                  keyboardType="numeric"
                  maxLength={9}
                  onChangeText={(text) => {
                    if (text === "") setValue("quantity", 0);
                    else setValue("quantity", parseInt(text.replace(/[^0-9]/g, "")));
                    setQuantity(thousandsSystem(text.replace(/[^0-9]/g, "")));
                  }}
                />
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
                  value={price}
                  placeholder="Precio de venta"
                  maxLength={15}
                  right={price ? () => <TextStyle color={light.main2}>Precio de venta</TextStyle> : null}
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    if (num === "") setValue("value", "");
                    else setValue("value", parseInt(num.replace(/[^0-9]/g, "")));
                    setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
                  }}
                />
                {errors.value?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El precio de venta es requerido
                  </TextStyle>
                )}
                <InputStyle
                  value={purchase}
                  placeholder="Precio de compra"
                  right={
                    purchase ? () => <TextStyle color={light.main2}>Precio de compra</TextStyle> : null
                  }
                  maxLength={15}
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    if (num === "") setValue("purchase", "");
                    else setValue("purchase", parseInt(num.replace(/[^0-9]/g, "")));
                    setPurchase(thousandsSystem(num.replace(/[^0-9]/g, "")));
                  }}
                />
                {errors.purchase?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El precio de compra es requerido
                  </TextStyle>
                )}
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    // Alert.alert("PROXIMAMENTE NUEVO DISENO", "VOY A RECREAR VENTAS (GENERAL) PARA REDISEÑARLO Y HACERLO ESCALABLE")
                    if (recipeSelected)
                      return Alert.alert(
                        "REMOVER",
                        `¿Quieres eliminar ${sales ? "el reconteo" : "la receta"} (${
                          recipeSelected.name
                        })?`,
                        [
                          {
                            text: "No",
                            style: "cancel",
                          },
                          {
                            text: "Si",
                            onPress: () => {
                              setRecipeSelected(null);
                              setValue("recipe", null);
                            },
                          },
                        ],
                        { cancelable: true }
                      );
                    setModalVisibleRecipe(!modalVisibleRecipe);
                  }}
                >
                  <TextStyle>
                    {recipeSelected
                      ? `${sales ? "Reconteo" : "Receta"} (${
                          recipeSelected.name.length > 20
                            ? `${recipeSelected.name.slice(0, 20)}...`
                            : recipeSelected.name
                        })`
                      : `Agregar ${sales ? "reconteo" : "receta"}`}
                  </TextStyle>
                  <Ionicons
                    name="newspaper-outline"
                    color={light.textDark}
                    size={getFontSize(16)}
                    style={{ marginLeft: 10 }}
                  />
                </ButtonStyle>
              </View>
              <ButtonStyle
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
                onPress={() => {
                  setCategoryKey(Math.random());
                  setModalCategory(!modalCategory);
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
                    color={
                      category.length ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"
                    }
                  >
                    Seleccionar categorías {category.length ? `(${category.length})` : ""}
                  </TextStyle>
                  <Ionicons
                    color={
                      category.length ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"
                    }
                    size={getFontSize(15)}
                    name="caret-down"
                  />
                </View>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
                onPress={() => {
                  setSubcategoryKey(Math.random());
                  setModalSubcategory(!modalSubcategory);
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
                    color={
                      subcategory.length
                        ? mode === "light"
                          ? light.textDark
                          : dark.textWhite
                        : "#888888"
                    }
                  >
                    Seleccionar subcategorías {subcategory.length ? `(${subcategory.length})` : ""}
                  </TextStyle>
                  <Ionicons
                    color={
                      subcategory.length
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
            </View>
            <View>
              {editing && (
                <ButtonStyle
                  backgroundColor="transparent"
                  style={{
                    marginTop: 10,
                    borderWidth: 2,
                    borderColor: light.main2,
                  }}
                  onPress={() => onSubmitRemove()}
                >
                  <TextStyle center smallParagraph color={light.main2}>
                    Eliminar pedido
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor="transparent"
                style={{
                  borderWidth: 2,
                  borderColor: light.main2,
                }}
                onPress={handleSubmit(!editing ? onSubmitCreate : onSubmitEdit)}
              >
                <TextStyle center smallParagraph color={light.main2}>
                  {!editing ? "Añadir producto" : "Guardar"}
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Information
        modalVisible={modalVisibleRecipe}
        setModalVisible={setModalVisibleRecipe}
        style={{ backgroundColor: mode === "light" ? light.main4 : dark.main1 }}
        title={sales ? "RECONTEO" : "RECETA"}
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Lista de {sales ? "reconteos" : "recetas"}
            </TextStyle>
            <FlatList
              data={recipeList}
              style={{ maxHeight: 220, marginTop: 15 }}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Recipe item={item} />}
            />
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => navigation.navigate("CreateRecipe", { sales })}
            >
              <TextStyle center>Crear {sales ? "reconteo" : "receta"}</TextStyle>
            </ButtonStyle>
          </View>
        )}
      />
      <MultipleSelect
        key={categoryKey}
        modalVisible={modalCategory}
        setModalVisible={setModalCategory}
        noItemsText="No hay categoría"
        onSelectedItemsChange={(value) => {
          const options = groups.filter((g) => value.includes(g.id));
          const subcategories = options.map((o) => o.subcategory).flat();
          setSubcategoryOptions(subcategories.map((sub) => ({ ...sub, name: sub.subcategory })));
          setCategory(value);
          setSubcategoryKey(Math.random());
          setValue("category", value);
        }}
        selected={editing ? groups.filter((g) => category.includes(g.id)).map((g) => g.id) : []}
        data={groups
          .filter((g) => {
            const type = sales ? "sales" : "menu";
            if (g.type === type) return true;
          })
          .map((group) => ({ ...group, name: group.category }))}
      />
      <MultipleSelect
        key={subcategoryKey}
        modalVisible={modalSubcategory}
        setModalVisible={setModalSubcategory}
        noItemsText="No hay subcategoría"
        onSelectedItemsChange={(value) => {
          setSubcategory(value);
          setValue("subcategory", value);
        }}
        selected={
          editing
            ? groups
                .filter((g) => category.includes(g.id))
                .map((o) => o.subcategory)
                .flat()
                .map((sub) => sub.id)
                .filter((id) => item.subcategory.includes(id))
            : []
        }
        data={subcategoryOptions}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  catalogueCard: {
    width: Math.floor(SCREEN_WIDTH / 3),
    height: Math.floor(SCREEN_WIDTH / 3),
    borderRadius: 5,
  },
  footerCatalogue: {
    height: "40%",
    justifyContent: "center",
    backgroundColor: light.main2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recipeCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    width: SCREEN_WIDTH / 3.2,
  },
});

export default CreateProduct;
