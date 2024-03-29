import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useForm } from "react-hook-form";
import { thousandsSystem, random } from "@helpers/libs";
import { useSelector, useDispatch } from "react-redux";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import Information from "@components/Information";
import { add, edit } from "@features/sales/recipesSlice";
import { addRecipe, editRecipe } from "@api";
import theme from "@theme";

const { light, dark } = theme();

const Ingredient = ({ item, onChange, initialCount = 0 }) => {
  const mode = useSelector((state) => state.mode);

  const [count, setCount] = useState(initialCount);
  const [informationCount, setInformationCount] = useState(initialCount || "");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setInformationCount(thousandsSystem(count || ""));
  }, [count]);

  return (
    <>
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <TextStyle style={{ marginBottom: 4 }} smallParagraph color={light.main2}>
          {item.name} ({item.unit})
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (count === 0) return;
              const quantity = count - 1;
              setCount(quantity);
              onChange(quantity);
            }}
          >
            <TextStyle>-</TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisible(!modalVisible)}
            style={{
              backgroundColor: mode === "light" ? light.main4 : dark.main2,
              paddingHorizontal: 10,
              paddingVertical: 7,
            }}
          >
            <TextStyle color={mode === "light" ? light.textDark : dark.textWhite} smallParagraph>
              {item.name}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (count === item.portion) return;
              const quantity = count + 1;
              setCount(quantity);
              onChange(quantity);
            }}
          >
            <TextStyle>+</TextStyle>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
          <TextStyle
            style={{ marginTop: 4 }}
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(count)} {count ? (count === 1 ? "(Porción)" : "(Porciones)") : ""}
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
                if (parseInt(num.replace(/[^0-9]/g, "")) > item.portion) return;
                if (num === "") return setInformationCount("");
                setInformationCount(thousandsSystem(num.replace(/[^0-9]/g, "")));
              }}
            />
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                const quantity = parseInt(informationCount.replace(/[^0-9]/g, "")) || 0;
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

  const editing = route.params?.editing;
  const item = route.params?.item;
  const sales = route.params?.sales;

  const [name, setName] = useState(editing ? item.name : "");
  const [ingredients, setIngredients] = useState(editing ? item.ingredients : []);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validation = (condition) =>
      inventory.filter((i) => i.visible === "both" || i.visible === condition);
    if (sales) setList(validation("sales"));
    else setList(validation("menu"));
  }, [sales]);

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${sales ? "reconteo" : "receta"}` });

    register("name", { value: editing ? item.name : "", required: true });
    register("ingredients", {
      value: editing ? item.ingredients : "",
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
      data.type = sales ? "sales" : "menu";
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
                Crear {sales ? "reconteo" : "receta"}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              {!list.length && (
                <TextStyle smallParagraph center color={light.main2}>
                  NO HAY LISTA DISPONIBLE EN INVENTARIO
                </TextStyle>
              )}
              <InputStyle
                value={name}
                stylesContainer={{ opacity: list.length !== 0 ? 1 : 0.6 }}
                editable={list.length !== 0}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
                right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                maxLength={30}
                placeholder={`Nombre de${sales ? "l reconteo" : " la receta"}`}
              />
              {errors.name?.type && list.length !== 0 && (
                <TextStyle verySmall color={light.main2}>
                  El nombre es requerido
                </TextStyle>
              )}
              {list.length !== 0 && (
                <ScrollView
                  style={{ maxHeight: 250, marginTop: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[styles.row, { flexWrap: "wrap", justifyContent: "space-evenly" }]}>
                    {list.map((item) => (
                      <Ingredient
                        item={item}
                        initialCount={ingredients.find((i) => i.id === item.id)?.portion || 0}
                        onChange={(portion) => {
                          const found = ingredients.find((i) => i.id === item.id);
                          if (found) {
                            let newIngredients;
                            if (portion === 0)
                              newIngredients = ingredients.filter((i) => i.id !== item.id);
                            else {
                              newIngredients = ingredients.map((i) => {
                                if (i.id === item.id) return { ...i, portion };
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
                                portion,
                              },
                            ];
                            setValue("ingredients", newIngredients);
                            setIngredients(newIngredients);
                          }
                        }}
                        key={item.id}
                      />
                    ))}
                  </View>
                </ScrollView>
              )}
              {errors.ingredients?.type && list.length !== 0 && (
                <TextStyle verySmall style={{ marginTop: 20 }} color={light.main2}>
                  {errors.ingredients?.message}
                </TextStyle>
              )}
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ opacity: list.length !== 0 ? 1 : 0.6 }}
              onPress={handleSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
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
});

export default CreateRecipe;
