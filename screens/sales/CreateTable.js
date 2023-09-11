import { useEffect, useState } from "react";
import { View, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { add, edit } from "@features/tables/informationSlice";
import { random } from "@helpers/libs";
import { addTable, editTable } from "@api";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateTable = ({ navigation, route }) => {
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm();

  const editing = route.params?.editing;
  const tableEditing = route.params?.item;

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const tables = useSelector((state) => state.tables);
  const activeGroup = useSelector((state) => state.activeGroup);

  const [table, setTable] = useState(editing ? tableEditing.table : "");
  const [name, setName] = useState(editing ? tableEditing.name : "");
  const [description, setDescription] = useState(
    editing ? tableEditing.description : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    register("table", {
      value: editing ? tableEditing.table : "",
      required: true,
      validate: {
        exists: (table) => {
          const exists = tables.find((t) => t.table === table);

          return (
            (!editing || !exists ? !exists : tableEditing.table === table) ||
            "La mesa ya existe"
          );
        },
      },
    });
    register("name", { value: editing ? tableEditing.name : "" });
    register("description", { value: editing ? tableEditing.description : "" });
  }, []);

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.creationDate = tableEditing.creationDate;
    data.id = tableEditing.id;
    dispatch(edit({ id: tableEditing.id, data }));
    navigation.pop();
    await editTable({
      identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
      table: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const id = random(20);
    if (tables.find((group) => group.id === id)) onSubmitCreate(data);
    else {
      data.id = id;
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.pop();
      await addTable({
        identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
        table: data,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
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
                Creación de mesa
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                placeholder="Mesa"
                right={table ? () => <TextStyle color={light.main2}>Mesa</TextStyle> : null}
                value={table}
                maxLength={5}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("table", text);
                  setTable(text.replace(/[^0-9]/g, ""));
                }}
              />
              {errors.table?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.table.type === "required"
                    ? "Numero de mesa obligatorio"
                    : errors.table.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Nombre"
                right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                value={name}
                maxLength={20}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
              />
              <InputStyle
                placeholder="Descripción"
                right={description ? () => <TextStyle color={light.main2}>Descripción</TextStyle> : null}
                value={description}
                maxLength={100}
                onChangeText={(text) => {
                  setValue("description", text);
                  setDescription(text);
                }}
              />
            </View>
            <ButtonStyle
              onPress={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}
              backgroundColor={light.main2}
            >
              <TextStyle center>Crear</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateTable;
