import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { random } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import { addRoster, editRoster, removeRoster } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";
import { thousandsSystem } from "@helpers/libs";
import { add, edit, remove } from "@features/function/rosterSlice";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateRoster = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const roster = useSelector((state) => state.roster);
  const activeGroup = useSelector((state) => state.activeGroup);
  const helpers = useSelector((state) => state.helpers);

  const data = route.params?.item;
  const editing = route.params?.editing;

  const [name, setName] = useState(editing ? data.name : "");
  const [amount, setAmount] = useState(
    editing ? thousandsSystem(data.amount) : ""
  );
  const [rosterSelected, setRosterSelected] = useState(
    editing ? data.roster : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    register("name", { value: editing ? data.name : "", required: true });
    register("amount", { value: editing ? data.amount : "", required: true });
    register("roster", { value: editing ? data.roster : "", required: true });
  }, []);

  const onSubmitEdit = async (d) => {
    Keyboard.dismiss();
    d.ref = data.ref;
    d.creationDate = data.creationDate;
    d.modificationDate = new Date().getTime();
    dispatch(edit({ id: data.id, data: d }));
    navigation.pop();
    await editRoster({
      email: activeGroup.active ? activeGroup.email : user.email,
      roster: d,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const id = random(20);
    if (roster.find((r) => r.id === id)) onSubmitCreate(data);

    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    navigation.pop();
    await addRoster({
      email: activeGroup.active ? activeGroup.email : user.email,
      roster: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const deleteRoster = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar la nómina?`,
      "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(remove({ id: data.id }));
            navigation.pop();
            await removeRoster({
              email: activeGroup.active ? activeGroup.email : user.email,
              id: data.id,
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
                Crear Nómina
              </TextStyle>
            </View>
            <View style={{ marginVertical: 10 }}>
              <InputStyle
                value={name}
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
              {errors.name?.type && (
                <TextStyle verySmall color={light.main2}>
                  El nombre es obligatorio
                </TextStyle>
              )}
              <InputStyle
                value={amount}
                placeholder="Valor Total"
                right={
                  amount
                    ? () => <TextStyle color={light.main2}>Valor</TextStyle>
                    : null
                }
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("amount", text.replace(/[^0-9]/g, ""));
                  setAmount(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
              />
              {errors.amount?.type && (
                <TextStyle verySmall color={light.main2}>
                  El valor es obligatorio
                </TextStyle>
              )}
              <TouchableOpacity
                style={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  borderRadius: 8,
                  marginVertical: 4,
                }}
              >
                <Picker
                  style={{
                    color: mode === "light" ? light.textDark : dark.textWhite,
                  }}
                  selectedValue={rosterSelected}
                  onValueChange={(value) => {
                    setValue("roster", value);
                    setRosterSelected(value);
                  }}
                >
                  <Picker.Item label="SELECCIONE EL CARGO" value="" />
                  {helpers.map((item) => (
                    <Picker.Item
                      key={item.id}
                      label={item.user}
                      value={item.user}
                    />
                  ))}
                </Picker>
              </TouchableOpacity>
              {errors.roster?.type && (
                <TextStyle verySmall color={light.main2}>
                  Seleccione el cargo al hacer la nómina
                </TextStyle>
              )}
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => deleteRoster()}
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
              {editing ? "Guardar" : "Pagado"}
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateRoster;