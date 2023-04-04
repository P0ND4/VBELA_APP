import { useEffect, useState } from "react";
import {
  View,
  Switch,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import { add, edit, remove } from "../features/tables/ordersSlice";
import { random, thousandsSystem } from "../helpers/libs";
import { addOrder, editOrder, removeOrder } from "../api";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import InputStyle from "../components/InputStyle";
import theme from "../theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateOrder = ({ navigation, route }) => {
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm();

  const editing = route.params?.editing;
  const order = route.params?.item;
  const data = route.params?.data;
  const ref = route.params?.ref;

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const activeGroup = useSelector((state) => state.activeGroup);

  const [name, setName] = useState(editing ? order.name : route.params.name);
  const [type, setType] = useState(editing ? order.type : null);
  const [gave, setGave] = useState(editing ? order.gave : "");
  const [amount, setAmount] = useState(
    editing ? thousandsSystem(order.amount) : ""
  );
  const [pay, setPay] = useState(editing ? order.pay : false);
  const [amountTotal, setAmountTotal] = useState(0);

  const dispatch = useDispatch();

  const width = Dimensions.get("window").width;

  const options = [
    { label: "Seleccionar", value: null },
    { label: "Desayuno", value: "breakfast" },
    { label: "Almuerzo", value: "lunch" },
    { label: "Cena", value: "dinner" },
  ];

  useEffect(() => {
    setAmountTotal(amount.replace(/[^0-9]/g, "") * gave);
  }, [amount, gave]);

  useEffect(() => {
    register("product", { value: data });
    register("name", { value: editing ? order.name : "" });
    register("type", { value: editing ? order.type : "", required: true });
    register("gave", { value: editing ? order.gave : "", required: true });
    register("amount", { value: editing ? order.amount : "", required: true });
    register("pay", { value: editing ? order.pay : false });
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: data === "food" ? "COMIDA" : "BEBIDA" });
  }, [data]);

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.creationDate = order.creationDate;
    data.ref = order.ref;
    data.id = order.id;
    dispatch(edit({ id: order.id, data }));
    navigation.pop();
    await editOrder({
      email: activeGroup.active ? activeGroup.email : user.email,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const id = random(20);
    if (orders.find((order) => order.id === id)) onSubmitCreate(data);
    else {
      data.id = id;
      data.ref = ref;
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addOrder({
        email: activeGroup.active ? activeGroup.email : user.email,
        order: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  const deleteOrder = () => {
    Keyboard.dismiss();
    Alert.alert(
      "¿Estás seguro que quieres eliminar la orden?",
      "La información almacenada en esta orden se eliminarán",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(remove({ id: order.id }));
            navigation.pop();
            await removeOrder({
              email: activeGroup.active ? activeGroup.email : user.email,
              id: order.id,
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
    <Layout
      style={{
        marginTop: 0,
        padding: 30,
      }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              justifyContent: "space-around",
              alignItem: "center",
              flex: 1,
            }}
          >
            <TextStyle
              smallTitle
              center
              color={mode === "light" ? light.textDark : dark.textWhite}
              customStyle={{ marginVertical: 20 }}
            >
              Total:{" "}
              <TextStyle smallTitle color={light.main2}>
                {thousandsSystem(amountTotal)}
              </TextStyle>
            </TextStyle>
            <View>
              <View>
                <TextStyle bigTitle center color={light.main2}>
                  VBELA
                </TextStyle>
                <TextStyle
                  bigParagraph
                  center
                  color={mode === "light" ? null : dark.textWhite}
                >
                  Creación de orden
                </TextStyle>
              </View>
              <View style={{ marginTop: 30 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                    customStyle={{ marginRight: 10 }}
                  >
                    Tipo de {data === "food" ? "comida" : "bebida"}
                  </TextStyle>
                  <View
                    style={{
                      borderRadius: 8,
                      marginVertical: 4,
                      borderWidth: 1,
                      borderColor: mode === "light" ? light.main5 : dark.main2,
                    }}
                  >
                    <Picker
                      mode="dropdown"
                      dropdownIconColor="#888888"
                      style={{
                        width: width / 2.5,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color: "#888888",
                        fontSize: 20,
                      }}
                      selectedValue={type}
                      onValueChange={(itemValue, itemIndex) => {
                        setType(itemValue);
                        setValue("type", itemValue);
                      }}
                    >
                      {options.map((item) => (
                        <Picker.Item
                          key={item.value}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                {errors.type?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El tipo de {data === "food" ? "comida" : "bebida"} es
                    requerida
                  </TextStyle>
                )}
                <InputStyle
                  placeholder="Nombre"
                  value={name}
                  maxLength={15}
                  onChangeText={(text) => {
                    setValue("name", text);
                    setName(text);
                  }}
                />
                <InputStyle
                  placeholder="Costo (por unidad)"
                  value={amount}
                  maxLength={10}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    setValue("amount", text.replace(/[^0-9]/g, ""));
                    setAmount(thousandsSystem(text.replace(/[^0-9]/g, "")));
                  }}
                />
                {errors.amount?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El costo de {data === "food" ? "comida" : "bebida"} es
                    requerida
                  </TextStyle>
                )}
                <InputStyle
                  placeholder="Cantidad dada"
                  value={gave}
                  maxLength={3}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    setValue("gave", text.replace(/[^0-9]/g, ""));
                    setGave(text.replace(/[^0-9]/g, ""));
                  }}
                />
                {errors.gave?.type && (
                  <TextStyle verySmall color={light.main2}>
                    La cantidad de {data === "food" ? "comida" : "bebida"} es
                    requerida
                  </TextStyle>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: 10,
                  }}
                >
                  {(!editing || !order.pay) && (
                    <>
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                        customStyle={{ marginRight: 10 }}
                      >
                        {!pay ? "Registrar" : "Cerrar"} mesa
                      </TextStyle>
                      <Switch
                        trackColor={{ false: dark.main2, true: light.main2 }}
                        thumbColor={light.main4}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => {
                          setPay(!pay);
                          setValue("pay", !pay);
                        }}
                        value={pay}
                      />
                    </>
                  )}
                </View>
              </View>
              {editing && (
                <ButtonStyle onPress={() => deleteOrder()}>
                  Eliminar
                </ButtonStyle>
              )}
              <ButtonStyle
                onPress={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}
                backgroundColor={light.main2}
              >
                {editing ? "Guardar" : "Crear"}
              </ButtonStyle>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateOrder;
