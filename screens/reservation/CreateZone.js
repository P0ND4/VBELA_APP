import { useEffect, useState } from "react";
import { View, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { add, edit } from "@features/zones/informationSlice";
import { random } from "@helpers/libs";
import { addZone, editZone } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const CreateZone = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);
  const helperStatus = useSelector((state) => state.helperStatus);

  const zone = route.params?.item;
  const editing = route.params?.editing;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editing ? zone.name : "");
  const [description, setDescription] = useState(
    editing ? zone.description : ""
  );
  const [location, setLocation] = useState(editing ? zone.location : "");

  const dispatch = useDispatch();

  useEffect(() => {
    register("name", { value: editing ? zone.name : "", required: true });
    register("description", { value: editing ? zone.description : "" });
    register("location", { value: editing ? zone.location : "" });
  }, []);

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.ref = zone.ref;
    data.creationDate = route.params.item.creationDate;
    dispatch(edit({ ref: zone.ref, data }));
    navigation.pop();
    await editZone({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      zone: data,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const ref = random(20);
    if (zones.find((group) => group.ref === ref)) onSubmitCreate(data);
    else {
      data.ref = ref;
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(add(data));
      navigation.replace("CreatePlace", { ref });
      await addZone({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        zone: data,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  return (
    <Layout style={{ padding: 30 }}>
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
                Creación de zona
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                value={name}
                right={
                  name
                    ? () => <TextStyle color={light.main2}>Nombre</TextStyle>
                    : null
                }
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
                value={description}
                right={
                  description
                    ? () => (
                        <TextStyle color={light.main2}>Descripción</TextStyle>
                      )
                    : null
                }
                placeholder="Descripción"
                maxLength={100}
                onChangeText={(text) => {
                  setValue("description", text);
                  setDescription(text);
                }}
              />
              <InputStyle
                value={location}
                right={
                  location
                    ? () => <TextStyle color={light.main2}>Ubicación</TextStyle>
                    : null
                }
                placeholder="Ubicación"
                maxLength={50}
                onChangeText={(text) => {
                  setValue("location", text);
                  setLocation(text);
                }}
              />
            </View>
            <ButtonStyle
              onPress={handleSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
              backgroundColor={light.main2}
            >
              <TextStyle center>{editing ? "Guardar" : "Crear"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreateZone;
