import { useEffect, useRef, useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { addRoster, editRoster, removeRoster } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import { thousandsSystem, getFontSize } from "@helpers/libs";
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
  const helperStatus = useSelector((state) => state.helperStatus);
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
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const pickerRef = useRef();

  useEffect(() => {
    register("name", { value: editing ? data.name : "", required: true });
    register("amount", { value: editing ? data.amount : "", required: true });
    register("roster", { value: editing ? data.roster : "", required: true });
  }, []);

  const cleanData = () => {
    setValue("name", "");
    setValue("amount", "");
    setValue("roster", "");
    setName("");
    setAmount("");
    setRosterSelected("");
    navigation.setParams({ editing: false, item: null });
  };

  const onSubmitEdit = async (d) => {
    setLoading(true);
    Keyboard.dismiss();
    d.ref = data.ref;
    d.creationDate = data.creationDate;
    d.modificationDate = new Date().getTime();
    cleanData();
    dispatch(edit({ id: data.id, data: d }));
    Alert.alert("ÉXITO", "Se ha editado la información correctamente");
    await editRoster({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      roster: d,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (roster.find((r) => r.id === id)) onSubmitCreate(data);

    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    cleanData();
    dispatch(add(data));
    Alert.alert("ÉXITO", "Se ha guardado la información correctamente");
    await addRoster({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      roster: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
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
            setLoading(true);
            cleanData();
            dispatch(remove({ id: data.id }));
            Alert.alert("ÉXITO", "Se ha eliminado la información correctamente");
            await removeRoster({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              id: data.id,
              helpers: helperStatus.active
                ? [helperStatus.id]
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
              <View>
                <ButtonStyle
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => pickerRef.current.focus()}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TextStyle
                      color={
                        rosterSelected
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                    >
                      {rosterSelected || "SELECCIONE EL CARGO"}
                    </TextStyle>
                    <Ionicons
                      color={rosterSelected ? "#FFFFFF" : "#AAAAAA"}
                      size={getFontSize(15)}
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
                    selectedValue={rosterSelected}
                    onValueChange={(value) => {
                      setValue("roster", value);
                      setRosterSelected(value);
                    }}
                  >
                    <Picker.Item
                      label="SELECCIONE EL CARGO"
                      value=""
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {helpers.map((item) => (
                      <Picker.Item
                        key={item.id}
                        label={item.user}
                        value={item.user}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {errors.roster?.type && (
                <TextStyle verySmall color={light.main2}>
                  Seleccione el cargo al hacer la nómina
                </TextStyle>
              )}
            </View>
            {editing && (
              <ButtonStyle
                onPress={() => {
                  if (loading) return;
                  deleteRoster();
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
            <ButtonStyle
              onPress={handleSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
              backgroundColor={light.main2}
            >
              <TextStyle center>{editing ? "Guardar" : "Pagado"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateRoster;
