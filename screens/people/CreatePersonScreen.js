import { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { add, edit as editPeople } from "@features/function/peopleSlice";
import { edit as editE } from "@features/function/economySlice";
import { random, thousandsSystem } from "@helpers/libs";
import { addPerson, editPerson, editEconomy } from "@api";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";

import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreatePerson = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const people = useSelector((state) => state.people);
  const economy = useSelector((state) => state.economy);
  const activeGroup = useSelector((state) => state.activeGroup);

  const type = route.params?.type;
  const editing = route.params?.editing;
  const dataP = route.params?.person;

  const [name, setName] = useState(editing ? dataP.name : "");
  const [identification, setIdentification] = useState(
    editing ? thousandsSystem(dataP.identification) : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    register("name", { value: editing ? dataP.name : "", required: true });
    register("identification", {
      value: editing ? dataP.identification : "",
      required: true,
    });

    navigation.setOptions({
      title: type === "supplier" ? "Crear Proveedor" : "Crear Cliente",
    });
  }, []);

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const id = random(20);
    if (people.find((p) => p.id === id)) onSubmitCreate(data);
    else {
      data.id = id;
      data.type = type;
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addPerson({
        email: activeGroup.active ? activeGroup.email : user.email,
        person: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();
    const foundEconomy = economy.find((e) => e.ref === dataP.id);
    if (foundEconomy) {
      dispatch(editE({
        id: foundEconomy.id,
        data: {
          ...foundEconomy,
          owner: { identification: data.identification, name: data.name },
        },
      }));
      await editEconomy({
        email: activeGroup.active ? activeGroup.email : user.email,
        economy: {
          ...foundEconomy,
          owner: { identification: data.identification, name: data.name },
        },
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
    data.modificationDate = new Date().getTime();
    data.id = dataP.id;
    data.type = dataP.type;
    data.creationDate = dataP.creationDate;
    dispatch(editPeople({ id: dataP.id, data }));
    navigation.pop();
    await editPerson({
      email: activeGroup.active ? activeGroup.email : user.email,
      person: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  return (
    <Layout style={styles.layout}>
      <View>
        <TextStyle bigTitle center color={light.main2}>
          VBELA
        </TextStyle>
        <TextStyle
          bigParagraph
          center
          color={mode === "light" ? null : dark.textWhite}
        >
          Crear nuevo {type === "supplier" ? "proveedor" : "cliente"}
        </TextStyle>
      </View>
      <View style={{ marginVertical: 20, width: "100%" }}>
        <InputStyle
          placeholder="Nombre"
          maxLength={50}
          value={name}
          right={
            name
              ? () => <TextStyle color={light.main2}>Nombre</TextStyle>
              : null
          }
          onChangeText={(text) => {
            setValue("name", text);
            setName(text);
          }}
        />
        {errors.name?.type === "required" && (
          <TextStyle verySmall color={light.main2}>
            El nombre es requerido
          </TextStyle>
        )}
        <InputStyle
          placeholder="Cédula"
          value={identification}
          maxLength={15}
          right={
            identification
              ? () => <TextStyle color={light.main2}>Cédula</TextStyle>
              : null
          }
          keyboardType="numeric"
          onChangeText={(text) => {
            setValue("identification", text.replace(/[^0-9]/g, ""));
            setIdentification(thousandsSystem(text.replace(/[^0-9]/g, "")));
          }}
        />
        {errors.identification?.type === "required" && (
          <TextStyle verySmall color={light.main2}>
            La cédula es requerido
          </TextStyle>
        )}
      </View>
      <ButtonStyle
        onPress={handleSubmit(!editing ? onSubmitCreate : onSubmitEdit)}
        backgroundColor={light.main2}
      >
        Crear
      </ButtonStyle>
    </Layout>
  );
};

const styles = StyleSheet.create({
  layout: {
    marginTop: 0,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreatePerson;