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
  const helperStatus = useSelector((state) => state.helperStatus);

  const type = route.params?.type;
  const editing = route.params?.editing;
  const dataP = route.params?.person;

  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        person: data,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const foundEconomy = economy.find((e) => e.ref === dataP.id);
    if (foundEconomy) {
      dispatch(
        editE({
          id: foundEconomy.id,
          data: {
            ...foundEconomy,
            owner: { identification: data.identification, name: data.name },
          },
        })
      );
      await editEconomy({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        economy: {
          ...foundEconomy,
          owner: { identification: data.identification, name: data.name },
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
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
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      person: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
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
        onPress={handleSubmit((data) => {
          if (loading) return;
          !editing ? onSubmitCreate(data) : onSubmitEdit(data);
        })}
        backgroundColor={light.main2}
      >
        <TextStyle center>Crear</TextStyle>
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
