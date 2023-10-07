import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { random } from "@helpers/libs";
import { addEconomy, editEconomy, removeEconomy } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";
import { thousandsSystem } from "@helpers/libs";
import { add, edit, remove } from "@features/function/economySlice";
import helperNotification from "@helpers/helperNotification";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateEconomy = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const helperStatus = useSelector((state) => state.helperStatus);

  const ref = route.params?.ref;
  const owner = route.params?.owner;
  const data = route.params?.item;
  const editing = route.params?.editing;
  const pay = route.params?.pay;

  const [name, setName] = useState(editing ? data.name : "");
  const [amount, setAmount] = useState(
    pay
      ? thousandsSystem(data.amount - data.payment)
      : editing
      ? thousandsSystem(data.amount)
      : ""
  );
  const [payment, setPayment] = useState(
    pay
      ? thousandsSystem(data.amount - data.payment)
      : editing
      ? thousandsSystem(data.payment)
      : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPayment(amount);
    if (amount.length > 0)
      setValue("payment", parseInt(amount.replace(/[^0-9]/g, "")));
  }, [amount]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (route.params.type === "expense")
      navigation.setOptions({
        title: `${
          editing && pay ? "Abonar" : editing ? "Editar" : "Crear"
        } gasto`,
      });

    if (route.params.type === "purchase")
      navigation.setOptions({
        title: `${
          editing && pay ? "Abonar" : editing ? "Editar" : "Crear"
        } compra`,
      });

    if (route.params.type === "debt")
      navigation.setOptions({
        title: "Abonar Deuda",
      });
  }, []);

  useEffect(() => {
    register("name", { value: editing ? data.name : "", required: true });
    register("amount", { value: editing ? data.amount : "", required: true });
    register("payment", { value: editing ? data.payment : "", required: true });
  }, []);

  const onSubmitEdit = async (d) => {
    setLoading(true);
    Keyboard.dismiss();
    d.id = data.id;
    d.type = data.type;
    d.ref = data.ref;
    d.owner = data.owner;
    if (pay) {
      d.amount = parseInt(data.amount);
      d.payment = parseInt(data.payment) + parseInt(d.payment);
    }
    d.creationDate = data.creationDate;
    d.modificationDate = new Date().getTime();
    dispatch(edit({ id: data.id, data: d }));
    navigation.pop();
    await editEconomy({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      economy: d,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
    if (route.params.type !== "debt") {
      await helperNotification(
        helperStatus,
        user,
        route.params.type === "expense" ? "Gasto editado" : "Compra editada",
        `${
          route.params.type === "expense"
            ? "Un gasto ha sido editado"
            : "Una compra ha sido editada"
        } por ${user.identifier}`,
        "accessToSupplier"
      );
    }
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (economy.find((group) => group.id === id)) onSubmitCreate(data);

    data.id = id;
    data.ref = ref;
    data.owner = owner;
    data.type = route.params.type;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    navigation.pop();
    await addEconomy({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      economy: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });

    if (route.params.type !== "debt") {
      await helperNotification(
        helperStatus,
        user,
        route.params.type === "expense" ? "Gasto creado" : "Compra creada",
        `${
          route.params.type === "expense"
            ? "Un gasto ha sido creado"
            : "Una compra ha sido creada"
        } por ${user.identifier}`,
        "accessToSupplier"
      );
    }
  };

  const deleteEconomy = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar ${
        route.params.type === "expense" ? "el gasto" : "la compra"
      }?`,
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
            dispatch(remove({ id: data.id }));
            navigation.pop();
            await removeEconomy({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              id: data.id,
              helpers: helperStatus.active
                ? [helperStatus.id]
                : user.helpers.map((h) => h.id),
            });
            await helperNotification(
              helperStatus,
              user,
              route.params.type === "expense"
                ? "Gasto eliminado"
                : "Compra eliminada",
              `${
                route.params.type === "expense"
                  ? "Un gasto ha sido eliminado"
                  : "Una compra ha sido eliminada"
              } por ${user.identifier}`,
              "accessToSupplier"
            );
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
                {editing && pay ? "Abonar" : editing ? "Editar" : "Crear"}{" "}
                {route.params.type === "expense"
                  ? "Gasto"
                  : route.params.type === "purchase"
                  ? "Compra"
                  : "Deuda"}
              </TextStyle>
            </View>
            {editing && (
              <View style={{ marginVertical: 10 }}>
                <TextStyle color={light.main2}>
                  {route.params.type === "debt" ? "Cliente" : "Proveedor"}:{" "}
                  {data.owner?.name}
                </TextStyle>
                {pay && (
                  <TextStyle color={light.main2}>
                    Total: {thousandsSystem(data.amount)}
                  </TextStyle>
                )}
                {pay && (
                  <TextStyle color={light.main2}>
                    Deuda: {thousandsSystem(data.amount - data.payment)}
                  </TextStyle>
                )}
              </View>
            )}
            <View style={{ marginVertical: 10 }}>
              {route.params.type !== "debt" && (
                <InputStyle
                  value={name}
                  editable={!editing || !pay}
                  stylesContainer={{ opacity: editing && pay ? 0.5 : 1 }}
                  placeholder="Nombre"
                  right={
                    name
                      ? () => <TextStyle color={light.main2}>Nombre</TextStyle>
                      : null
                  }
                  maxLength={20}
                  onChangeText={(text) => {
                    setValue("name", text);
                    setName(text);
                  }}
                />
              )}
              {errors.name?.type && (
                <TextStyle verySmall color={light.main2}>
                  El nombre es obligatorio
                </TextStyle>
              )}
              <InputStyle
                value={amount}
                placeholder="Valor Total"
                editable={!editing || !pay}
                stylesContainer={{ opacity: editing && pay ? 0.5 : 1 }}
                right={
                  amount
                    ? () => <TextStyle color={light.main2}>Valor</TextStyle>
                    : null
                }
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("amount", parseInt(text.replace(/[^0-9]/g, "")));
                  setAmount(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
              {errors.amount?.type && (
                <TextStyle verySmall color={light.main2}>
                  El valor es obligatorio
                </TextStyle>
              )}
            </View>
            {editing && route.params.type !== "debt" && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteEconomy();
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ButtonStyle
                onPress={handleSubmit((data) => {
                  if (loading) return;
                  editing ? onSubmitEdit(data) : onSubmitCreate(data);
                })}
                backgroundColor={light.main2}
                style={{ width: "40%" }}
              >
                <TextStyle center>
                  {editing && pay ? "Pagar" : editing ? "Guardar" : "Pagado"}
                </TextStyle>
              </ButtonStyle>
              <InputStyle
                value={payment}
                stylesContainer={{ width: "55%" }}
                placeholder="Abono"
                right={
                  payment
                    ? () => <TextStyle color={light.main2}>Abono</TextStyle>
                    : null
                }
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, "");
                  if (parseInt(num) > parseInt(amount.replace(/[^0-9]/g, "")))
                    return;
                  setValue("payment", num.length > 0 ? parseInt(num) : "");
                  setPayment(thousandsSystem(num));
                }}
              />
            </View>
            {errors.payment?.type && (
              <TextStyle right verySmall color={light.main2}>
                El campo está vacío, digite el abono o el monto pagado
              </TextStyle>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateEconomy;
