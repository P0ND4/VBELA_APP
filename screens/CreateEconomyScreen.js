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
import { random } from "../helpers/libs";
import { addEconomy, editEconomy, removeEconomy } from "../api";
import ButtonStyle from "../components/ButtonStyle";
import InputStyle from "../components/InputStyle";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import theme from "../theme";
import { thousandsSystem } from "../helpers/libs";
import { add, edit, remove } from "../features/function/economySlice";
import helperNotification from "../helpers/helperNotification";

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
  const groups = useSelector((state) => state.groups);
  const activeGroup = useSelector((state) => state.activeGroup);

  const data = route.params?.item;
  const editing = route.params?.editing;

  const [name, setName] = useState(editing ? data.name : "");
  const [amount, setAmount] = useState(
    editing ? thousandsSystem(data.amount) : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (route.params.type === "expense")
      navigation.setOptions({ title: "Crear gasto" });
    else navigation.setOptions({ title: "Crear compra" });
  }, []);

  useEffect(() => {
    register("name", { value: editing ? data.name : "", required: true });
    register("amount", { value: editing ? data.amount : "", required: true });
  }, []);

  const onSubmitEdit = async (d) => {
    Keyboard.dismiss();
    d.ref = data.ref;
    d.type = data.type;
    d.creationDate = data.creationDate;
    d.modificationDate = new Date().getTime();
    dispatch(edit({ ref: data.ref, data: d }));
    navigation.pop();
    await editEconomy({
      email: activeGroup.active ? activeGroup.email : user.email,
      economy: d,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      activeGroup,
      user,
      route.params.type === "expense" ? "Gasto editado" : "Compra editada",
      `${
        route.params.type === "expense"
          ? "Un gasto ha sido editado"
          : "Una compra ha sido editada"
      } por ${user.email}`
    );
  };

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const ref = random(20);
    if (groups.find((group) => group.ref === ref)) onSubmitCreate(data);

    data.ref = ref;
    data.type = route.params.type;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    navigation.pop();
    await addEconomy({
      email: activeGroup.active ? activeGroup.email : user.email,
      economy: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });

    await helperNotification(
      activeGroup,
      user,
      route.params.type === "expense" ? "Gasto creado" : "Compra creada",
      `${
        route.params.type === "expense"
          ? "Un gasto ha sido creado"
          : "Una compra ha sido creada"
      } por ${user.email}`
    );
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
            dispatch(remove({ ref: data.ref }));
            navigation.pop();
            await removeEconomy({
              email: activeGroup.active ? activeGroup.email : user.email,
              ref: data.ref,
              groups: activeGroup.active
                ? [activeGroup.id]
                : user.helpers.map((h) => h.id),
            });
            await helperNotification(
              activeGroup,
              user,
              route.params.type === "expense"
                ? "Gasto eliminado"
                : "Compra eliminada",
              `${
                route.params.type === "expense"
                  ? "Un gasto ha sido eliminado"
                  : "Una compra ha sido eliminada"
              } por ${user.email}`
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
                Crear {route.params.type === "expense" ? "Gasto" : "Compra"}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                value={name}
                placeholder="Nombre"
                maxLength={20}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
              />
              {errors.name?.type && (
                <TextStyle verySmall color={light.main2}>
                  El nombre es obligatorio
                </TextStyle>
              )}
              <InputStyle
                value={amount}
                placeholder="Valor"
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("amount", text.replace(/[^0-9]/g, ""));
                  setAmount(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
              {errors.value?.type && (
                <TextStyle verySmall color={light.main2}>
                  El valor es obligatorio
                </TextStyle>
              )}
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => deleteEconomy()}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
              >
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Eliminar
                </TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              onPress={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}
              backgroundColor={light.main2}
            >
              {editing ? "Guardar" : "Crear"}
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateEconomy;
