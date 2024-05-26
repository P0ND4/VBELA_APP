import { useEffect, useState } from "react";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { add, edit, remove } from "@features/sales/groupsSlice";
import { random, getFontSize } from "@helpers/libs";
import { addGroup, editGroup, removeGroup } from "@api";
import Ionicons from "@expo/vector-icons/Ionicons";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const CreateGroup = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const groups = useSelector((state) => state.groups);
  const helperStatus = useSelector((state) => state.helperStatus);

  const group = route.params?.item;
  const editing = route.params?.editing;
  const type = route.params?.type;

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(editing ? group.category : "");
  const [subcategory, setSubcategory] = useState(editing ? group.subcategory : []);
  const [text, setText] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    register("category", {
      value: editing ? group.category : "",
      required: true,
    });
    register("subcategory", { value: editing ? group.subcategory : [] });
  }, []);

  const changeTags = () => {
    let tag = text.trim().replace(/\s+/g, " "); // Remplazar todos los espacios con uno solo
    if (tag.length > 0) {
      if (subcategory.length < 100) {
        const newTags = tag
          .split(",")
          .map((tag) => tag.trim().slice(0, 40))
          .filter((tag) => tag !== "" && !subcategory.includes(tag))
          .map((tag) => ({ id: random(20), subcategory: tag }));
        const currentTags = [...subcategory, ...newTags];
        setValue("subcategory", currentTags);
        setSubcategory(currentTags);
      }
      setText("");
    }
  };

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.id = group.id;
    data.type = group.type;
    data.creationDate = group.creationDate;
    dispatch(edit({ id: group.id, data }));
    navigation.pop();
    await editGroup({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      group: data,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (groups.find((group) => group.id === id)) onSubmitCreate(data);
    else {
      data.id = id;
      data.type = type;
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addGroup({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        group: data,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  const deleteGroup = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar la categoría?`,
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
            dispatch(remove({ id: group.id }));
            navigation.pop();
            await removeGroup({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              id: group.id,
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
                Creación de zona
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                value={category}
                right={category ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                placeholder="Nombre de categoría"
                maxLength={20}
                onChangeText={(text) => {
                  setValue("category", text);
                  setCategory(text);
                }}
              />
              {errors.category?.type && (
                <TextStyle verySmall color={light.main2}>
                  El nombre es obligatorio
                </TextStyle>
              )}
              <View style={{ marginTop: 10 }}>
                <View style={{ justifyContent: "center" }}>
                  <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
                    Preciona "ENTER" o añade una coma despues de cada subcategoría
                  </TextStyle>
                  <View
                    style={[
                      styles.listContent,
                      {
                        backgroundColor: mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <View style={styles.listRules}>
                        {subcategory.map((tag) => (
                          <View
                            style={[
                              styles.list,
                              {
                                backgroundColor: mode === "light" ? light.main4 : dark.main1,
                              },
                            ]}
                            key={tag.id}
                          >
                            <TextStyle
                              bigParagraph
                              color={mode === "light" ? light.textDark : dark.textWhite}
                            >
                              {tag.subcategory}{" "}
                            </TextStyle>
                            <Ionicons
                              name="close-circle-outline"
                              onPress={() => {
                                const newSubcategory = subcategory.filter(
                                  (currentTag) => currentTag.id !== tag.id
                                );
                                setSubcategory(newSubcategory);
                                setValue("subcategory", newSubcategory);
                              }}
                              style={styles.icon}
                            />
                          </View>
                        ))}
                        <TextInput
                          value={text}
                          onChangeText={(e) => setText(e)}
                          onSubmitEditing={changeTags}
                          cursorColor={mode === "light" ? light.textDark : dark.textWhite}
                          style={[
                            styles.input,
                            {
                              color: mode === "light" ? light.textDark : dark.textWhite,
                            },
                          ]}
                        />
                      </View>
                    </ScrollView>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TextStyle paragrahp color={mode === "light" ? light.textDark : dark.textWhite}>
                    <TextStyle paragrahp color={light.main2}>
                      {100 - subcategory.length}
                    </TextStyle>{" "}
                    Subcategoría faltantes
                  </TextStyle>
                  <ButtonStyle
                    onPress={() => {
                      setValue("subcategory", []);
                      setSubcategory([]);
                    }}
                    backgroundColor={light.main2}
                    style={{ width: "auto" }}
                  >
                    <TextStyle>Remover Todo</TextStyle>
                  </ButtonStyle>
                </View>
              </View>
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteGroup();
                }}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
              >
                <TextStyle center color={mode === "light" ? light.textDark : dark.textWhite}>
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

const styles = StyleSheet.create({
  listContent: {
    padding: 7,
    borderColor: light.main2,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 12,
    maxHeight: 300,
  },
  listRules: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  list: {
    marginVertical: 4,
    marginHorizontal: 3,
    borderRadius: 5,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: getFontSize(20),
    color: light.main2,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: getFontSize(16),
    padding: 5,
  },
});

export default CreateGroup;
