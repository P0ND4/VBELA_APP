import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { View, StyleSheet, Alert, Dimensions } from "react-native";
import {
  add as addM,
  edit as editM,
  remove as removeM,
} from "@features/tables/menuSlice";
import {
  add as addP,
  edit as editP,
  remove as removeP,
} from "@features/sales/productsSlice";
import {
  addMenu,
  editMenu,
  removeMenu,
  addProduct,
  editProduct,
  removeProduct,
} from "@api";
import { thousandsSystem, random } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
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

  const editing = route.params?.editing;
  const item = route.params?.item;
  const sales = route.params?.sales;

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const menu = useSelector((state) => state.menu);
  const products = useSelector((state) => state.products);
  const activeGroup = useSelector((state) => state.activeGroup);

  const [name, setName] = useState(editing ? item.name : "");
  const [price, setPrice] = useState(
    editing ? thousandsSystem(item.value) : ""
  );
  const [unit, setUnit] = useState(editing ? item.unit : "");
  const [quantity, setQuantity] = useState(
    editing ? thousandsSystem(item.quantity || 0) : ""
  );
  const [reorder, setReorder] = useState(
    editing ? thousandsSystem(item.reorder || 0) : ""
  );

  const dispatch = useDispatch();
  const pickerRef = useRef();

  const setSelection = route.params?.setSelection;
  const selection = route.params?.selection;

  useEffect(() => {
    navigation.setOptions({
      title: sales ? "Nuevo producto/servicio" : "Nuevo menú",
    });
  }, []);

  useEffect(() => {
    register("name", { value: editing ? item.name : "", required: true });
    register("unit", { value: editing ? item.unit : "", required: true });
    register("quantity", { value: editing ? item.quantity : 0 });
    register("reorder", { value: editing ? item.reorder : 0 });
    register("value", { value: editing ? item.value : "", required: true });
  }, []);

  const onSubmitCreate = async (data) => {
    const id = random(20);
    if (menu.find((m) => m.id === id) && !sales) return onSubmitCreate(data);
    if (products.find((p) => p.id === id) && sales) return onSubmitCreate(data);
    data.id = id;
    data.group = null;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    if (sales) {
      dispatch(addP(data));
      navigation.pop();
      await addProduct({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        product: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id)
      });
    } else {
      dispatch(addM(data));
      navigation.pop();
      await addMenu({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        menu: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
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
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        product: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    } else {
      dispatch(editM({ id: item.id, data }));
      navigation.pop();
      await editMenu({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        menu: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
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
              identifier: activeGroup.active
                ? activeGroup.identifier
                : user.identifier,
              id: item.id,
              groups: activeGroup.active
                ? [activeGroup.id]
                : user.helpers.map((h) => h.id),
            });
          } else {
            dispatch(removeM({ id: item.id }));
            navigation.pop();
            await removeMenu({
              identifier: activeGroup.active
                ? activeGroup.identifier
                : user.identifier,
              id: item.id,
              groups: activeGroup.active
                ? [activeGroup.id]
                : user.helpers.map((h) => h.id),
            });
          }
        },
      },
    ]);
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
            right={
              quantity
                ? () => <TextStyle color={light.main2}>Cantidad</TextStyle>
                : null
            }
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
              reorder
                ? () => (
                    <TextStyle color={light.main2}>Punto de reorden</TextStyle>
                  )
                : null
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
            placeholder="Valor por unidad"
            maxLength={15}
            keyboardType="numeric"
            onChangeText={(num) => {
              if (num === "") setValue("value", "");
              else setValue("value", parseInt(num.replace(/[^0-9]/g, "")));
              setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
          />
          {errors.value?.type && (
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
