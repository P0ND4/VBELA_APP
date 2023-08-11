import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { View, StyleSheet, Alert, Dimensions } from "react-native";
import { add, edit, remove } from "@features/tables/menuSlice";
import { addMenu, editMenu, removeMenu } from "@api";
import { thousandsSystem, random } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateProduct = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const editing = route.params.editing;
  const item = route.params.item;

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const menu = useSelector((state) => state.menu);
  const activeGroup = useSelector((state) => state.activeGroup);

  const [name, setName] = useState(editing ? item.name : "");
  const [price, setPrice] = useState(
    editing ? thousandsSystem(item.price) : ""
  );

  const dispatch = useDispatch();

  const setSelection = route.params.setSelection;
  const selection = route.params.selection;

  useEffect(() => {
    register("name", { value: editing ? item.name : "", required: true });
    register("price", { value: editing ? item.price : "", required: true });
  }, []);

  const addProduct = async (data) => {
    const id = random(20);
    if (menu.find((m) => m.id === id)) return addProduct(data);

    data.id = id;
    data.group = null;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();

    dispatch(add(data));
    navigation.pop();
    await addMenu({
      email: activeGroup.active ? activeGroup.email : user.email,
      menu: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const editProduct = async (data) => {
    data.id = item.id;
    data.group = null;
    data.creationDate = item.creationDate;
    data.modificationDate = new Date().getTime();

    dispatch(edit({ id: item.id, data }));
    setSelection(selection.filter((s) => s.id !== item.id));
    navigation.pop();
    await editMenu({
      email: activeGroup.active ? activeGroup.email : user.email,
      menu: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const removeProduct = async () => {
    Alert.alert("Eliminar", "¿Esta seguro que desea eliminar el producto?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          dispatch(remove({ id: item.id }));
          setSelection(selection.filter((s) => s.id !== item.id));
          navigation.pop();
          await removeMenu({
            email: activeGroup.active ? activeGroup.email : user.email,
            id: item.id,
            groups: activeGroup.active
              ? [activeGroup.id]
              : user.helpers.map((h) => h.id),
          });
        },
      },
    ]);
  };

  return (
    <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
      <View />
      <View style={{ alignItems: "center" }}>
        <View
          style={[
            styles.catalogueCard,
            {
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
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
              smallParagraph
            >
              {!name ? "Nombre" : name}
            </TextStyle>
          </View>
          <View style={styles.footerCatalogue}>
            <TextStyle verySmall>
              {!name
                ? "Nombre"
                : name.length > 18
                ? name.slice(0, 17) + "..."
                : name}
            </TextStyle>
            <TextStyle smallParagraph>{!price ? "0" : price}</TextStyle>
          </View>
        </View>
        <View style={{ marginTop: 20, width: "100%" }}>
          <InputStyle
            value={name}
            onChangeText={(text) => {
              setValue("name", text);
              setName(text);
            }}
            maxLength={16}
            placeholder="Nombre del producto"
          />
          {errors.name?.type && (
            <TextStyle verySmall color={light.main2}>
              El nombre es requerido
            </TextStyle>
          )}
          <InputStyle
            value={price}
            placeholder="Precio"
            maxLength={15}
            keyboardType="numeric"
            onChangeText={(num) => {
              setValue("price", parseInt(num.replace(/[^0-9]/g, "")));
              setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
          />
          {errors.price?.type && (
            <TextStyle verySmall color={light.main2}>
              El precio es requerido
            </TextStyle>
          )}
        </View>
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
            onPress={() => removeProduct()}
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
          onPress={handleSubmit(!editing ? addProduct : editProduct)}
        >
          <TextStyle center smallParagraph color={light.main2}>
            {!editing ? "Añadir producto" : "Guardar"}
          </TextStyle>
        </ButtonStyle>
      </View>
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
});

export default CreateProduct;
