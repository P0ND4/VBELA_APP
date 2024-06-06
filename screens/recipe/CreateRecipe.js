import { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  FlatList,
  Dimensions,
  TextInput,
} from "react-native";
import { useForm } from "react-hook-form";
import { thousandsSystem, convertThousandsSystem, random, getFontSize } from "@helpers/libs";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import Information from "@components/Information";
import { add, edit } from "@features/sales/recipesSlice";
import { addRecipe, editRecipe } from "@api";
import theme from "@theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const Ingredient = ({ item, onChange, initialCount = 0 }) => {
  const mode = useSelector((state) => state.mode);

  const [count, setCount] = useState(initialCount);
  const [informationCount, setInformationCount] = useState(initialCount || "");
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    setInformationCount(thousandsSystem(count || ""));
  }, [count]);

  return (
    <>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateElement", { editing: true, item })}
          style={[styles.table, { borderColor: textColor, width: SCREEN_WIDTH / 3 }]}
        >
          <TextStyle color={textColor} smallParagraph>
            {item.name}
          </TextStyle>
        </TouchableOpacity>
        <View style={[styles.table, { borderColor: textColor, width: SCREEN_WIDTH / 5.6 }]}>
          <TextStyle color={textColor} smallParagraph>
            {item.unit}
          </TextStyle>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(!modalVisible)}
          style={[styles.table, { borderColor: textColor, width: SCREEN_WIDTH / 3 }]}
        >
          <TextStyle color={textColor} smallParagraph>
            {thousandsSystem(count)}
          </TextStyle>
        </TouchableOpacity>
      </View>
      <Information
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        style={{
          backgroundColor: mode === "light" ? light.main4 : dark.main1,
        }}
        title={item.name}
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Cantidad total a utilizar
            </TextStyle>
            <InputStyle
              value={informationCount}
              placeholder="Cantidad"
              right={informationCount ? () => <TextStyle color={light.main2}>Cantidad</TextStyle> : null}
              maxLength={13}
              stylesContainer={{ marginVertical: 10 }}
              keyboardType="numeric"
              onChangeText={(num) => {
                const converted = convertThousandsSystem(num);
                setInformationCount(thousandsSystem(converted));
              }}
            />
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                const quantity = +convertThousandsSystem(informationCount) || 0;
                setCount(quantity);
                onChange(quantity);
                setModalVisible(false);
              }}
            >
              <TextStyle center>Guardar</TextStyle>
            </ButtonStyle>
          </View>
        )}
      />
    </>
  );
};

const CreateRecipe = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const mode = useSelector((state) => state.mode);
  const helperStatus = useSelector((state) => state.helperStatus);
  const user = useSelector((state) => state.user);
  const inventory = useSelector((state) => state.inventory);
  const recipes = useSelector((state) => state.recipes);

  const dispatch = useDispatch();

  const item = route.params?.item;
  const type = route.params?.type;
  const defaultValue = route.params?.defaultValue;

  const [name, setName] = useState(item?.name || defaultValue?.name || "");
  const [price, setPrice] = useState(
    item ? thousandsSystem(item?.value) : defaultValue?.value ? thousandsSystem(defaultValue?.value) : ""
  );
  const [search, setSearch] = useState("");
  const [ingredients, setIngredients] = useState(item?.ingredients || defaultValue?.ingredients || []);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const validation = (condition) => {
      const list = inventory.filter((i) => i.visible === "both" || i.visible === condition);
      if (!search) return list;
      const convertText = (text) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      const filtered = list.filter((l) => {
        if (convertText(l.name).includes(convertText(search))) return l;
        return;
      });
      return filtered;
    };
    if (type === "sales") setList(validation("sales"));
    else setList(validation("menu"));
  }, [type, search, inventory]);

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${type === "sales" ? "reconteo" : "receta"}` });

    register("name", { value: item?.name || defaultValue?.name || "", required: true });
    register("value", { value: item?.value || defaultValue?.value || "", required: true });
    register("ingredients", {
      value: item?.ingredients || defaultValue?.ingredients || "",
      validate: (array) => array.length > 0 || "Tiene que tener mínimo 1 ingrediente",
    });
  }, []);

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (recipes.find((ingredient) => ingredient.id === id)) onSubmitCreate(data);
    else {
      data.id = id;
      data.type = type === "sales" ? "sales" : "menu";
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addRecipe({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        recipe: data,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.id = item.id;
    data.type = item.type;
    data.creationDate = item.creationDate;

    dispatch(edit({ id: item.id, data }));
    navigation.pop();
    await editRecipe({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      recipe: data,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
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
                Crear {type === "sales" ? "reconteo" : "receta"}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              {!list.length && !search && (
                <TextStyle smallParagraph center color={light.main2}>
                  NO HAY LISTA DISPONIBLE EN INVENTARIO
                </TextStyle>
              )}
              <InputStyle
                value={name}
                stylesContainer={{ opacity: list.length !== 0 || search ? 1 : 0.6 }}
                editable={list.length !== 0 || search.length > 0}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
                right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                maxLength={30}
                placeholder={`Nombre de${type === "sales" ? "l reconteo" : " la receta"}`}
              />
              {errors.name?.type && (list.length !== 0 || search) && (
                <TextStyle verySmall color={light.main2}>
                  El nombre es requerido
                </TextStyle>
              )}
              <InputStyle
                value={price}
                maxLength={15}
                editable={list.length !== 0 || search.length > 0}
                stylesContainer={{ opacity: list.length !== 0 || search ? 1 : 0.6 }}
                keyboardType="numeric"
                onChangeText={(num) => {
                  if (num === "") setValue("value", "");
                  else setValue("value", parseInt(num.replace(/[^0-9]/g, "")));
                  setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
                }}
                right={price ? () => <TextStyle color={light.main2}>Venta</TextStyle> : null}
                placeholder="Precio de venta"
              />
              {errors.value?.type && (
                <TextStyle verySmall color={light.main2}>
                  El precio de venta es requerido
                </TextStyle>
              )}

              {(list.length !== 0 || search) && (
                <View style={{ marginTop: 20 }}>
                  <View style={[styles.header, styles.row]}>
                    <TextStyle smallParagraph>LISTADO DE INVENTARIO</TextStyle>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ borderBottomWidth: 1, borderColor: light.textDark }}>
                        <TextInput
                          placeholder="Buscar"
                          style={{ width: SCREEN_WIDTH / 3.5 }}
                          value={search}
                          onChangeText={(text) => setSearch(text)}
                        />
                      </View>
                      <Ionicons name="search" color={light.textDark} size={getFontSize(14)} />
                    </View>
                  </View>
                  <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                    <View>
                      <View style={{ flexDirection: "row" }}>
                        <View
                          style={[styles.table, { borderColor: textColor, width: SCREEN_WIDTH / 3 }]}
                        >
                          <TextStyle color={light.main2} smallParagraph>
                            NOMBRE
                          </TextStyle>
                        </View>
                        <View
                          style={[styles.table, { borderColor: textColor, width: SCREEN_WIDTH / 5.6 }]}
                        >
                          <TextStyle color={light.main2} smallParagraph>
                            UNIDAD
                          </TextStyle>
                        </View>
                        <View
                          style={[styles.table, { borderColor: textColor, width: SCREEN_WIDTH / 3 }]}
                        >
                          <TextStyle color={light.main2} smallParagraph>
                            CANTIDAD
                          </TextStyle>
                        </View>
                      </View>
                      <FlatList
                        data={list}
                        renderItem={({ item }) => (
                          <Ingredient
                            item={item}
                            initialCount={ingredients.find((i) => i.id === item.id)?.quantity || 0}
                            onChange={(quantity) => {
                              const found = ingredients.find((i) => i.id === item.id);
                              if (found) {
                                let newIngredients;
                                if (quantity === 0)
                                  newIngredients = ingredients.filter((i) => i.id !== item.id);
                                else {
                                  newIngredients = ingredients.map((i) => {
                                    if (i.id === item.id) return { ...i, quantity };
                                    return i;
                                  });
                                }
                                setIngredients(newIngredients);
                                setValue("ingredients", newIngredients);
                              } else {
                                const newIngredients = [
                                  ...ingredients,
                                  {
                                    id: item.id,
                                    unit: item.unit,
                                    name: item.name,
                                    quantity,
                                  },
                                ];
                                setValue("ingredients", newIngredients);
                                setIngredients(newIngredients);
                              }
                            }}
                          />
                        )}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={4}
                        scrollEnabled={false}
                      />
                    </View>
                  </ScrollView>
                </View>
              )}
              {errors.ingredients?.type && (list.length !== 0 || search) && (
                <TextStyle verySmall style={{ marginTop: 20 }} color={light.main2}>
                  {errors.ingredients?.message}
                </TextStyle>
              )}
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ opacity: list.length !== 0 || search ? 1 : 0.6 }}
              onPress={handleSubmit((data) => {
                if (loading) return;
                item ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
            >
              <TextStyle center>{item ? "Guardar" : "Crear"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: light.main2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  table: {
    width: 100,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  header: {
    width: "100%",
    backgroundColor: light.main2,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
});

export default CreateRecipe;
