import { useEffect, useState } from "react";
import { View, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { add, edit } from "@features/groups/nomenclaturesSlice";
import { random, thousandsSystem } from "@helpers/libs";
import { addNomenclature, editNomenclature } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreatePlace = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const mode = useSelector((state) => state.mode);
  const nomenclatures = useSelector((state) =>
    state.nomenclatures.filter((n) => n.ref === route.params.ref)
  );
  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);

  const place = route.params?.item;
  const editing = route.params?.editing;

  const [name, setName] = useState(editing ? place.name : "");
  const [amount, setAmount] = useState(
    editing ? thousandsSystem(place.value) : ""
  );
  const [capability, setCapability] = useState(editing ? place.capability : "");
  const [nomenclature, setNomenclature] = useState(
    editing ? place.nomenclature : ""
  );

  useEffect(() => {
    register("nomenclature", {
      value: editing ? place.nomenclature : "",
      required: true,
      validate: {
        exists: (nomenclature) => {
          const exists = nomenclatures.find(
            (n) => n.nomenclature === nomenclature
          );

          return (
            (!editing || !exists
              ? !exists
              : place.nomenclature === nomenclature) ||
            "La nomenclatura ya existe"
          );
        },
      },
    });
    register("name", { value: editing ? place.name : "" });
    register("value", { value: editing ? place.value : "", required: true });
    register("capability", {
      value: editing ? place.capability : "",
      required: true,
      validate: {
        min: (num) =>
          num > 0 || "Digíte el límite de personas que pueden  reservar",
        max: (num) => num <= 100 || "El máximo de capacidad es de 100 personas",
      },
    });
  }, []);

  const dispatch = useDispatch();

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.ref = place.ref;
    data.id = place.id;
    data.creationDate = place.creationDate;

    dispatch(edit({ id: place.id, data }));
    navigation.pop();
    await editNomenclature({
      email: activeGroup.active ? activeGroup.email : user.email,
      nomenclature: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const id = random(20);
    const exists = nomenclatures.find((n) => n.id === id);
    if (exists) return onSubmitCreate(data);

    data.ref = route.params.ref;
    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    navigation.pop();
    await addNomenclature({
      email: activeGroup.active ? activeGroup.email : user.email,
      nomenclature: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
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
                Creación de espacios
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                placeholder="Nomenclatura"
                maxLength={5}
                right={nomenclature ? () => <TextStyle color={light.main2}>Nomenclatura</TextStyle> : null}
                value={nomenclature}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("nomenclature", text);
                  setNomenclature(text.replace(/[^0-9]/g, ""));
                }}
              />
              {errors.nomenclature?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.nomenclature.type === "required"
                    ? "Nomenclatura obligatorio"
                    : errors.nomenclature.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Nombre"
                value={name}
                right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
                maxLength={20}
                onChangeText={(text) => {
                  setValue("name", text);
                  setName(text);
                }}
              />
              <InputStyle
                value={amount}
                right={amount ? () => <TextStyle color={light.main2}>Valor</TextStyle> : null}
                keyboardType="numeric"
                placeholder="Valor por día (por persona)"
                onChangeText={(text) => {
                  setValue("value", text.replace(/[^0-9]/g, ""));
                  setAmount(thousandsSystem(text.replace(/[^0-9]/g, "")));
                }}
                maxLength={10}
              />
              {errors.value?.type && (
                <TextStyle verySmall color={light.main2}>
                  Valor obligatorio
                </TextStyle>
              )}
              <InputStyle
                value={capability}
                right={capability ? () => <TextStyle color={light.main2}>Capacidad</TextStyle> : null}
                placeholder="Capacidad"
                maxLength={3}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("capability", text);
                  setCapability(text.replace(/[^0-9]/g, ""));
                }}
              />
              {errors.capability?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.capability.type === "required"
                    ? "Capacidad obligatoria"
                    : errors.capability.message}
                </TextStyle>
              )}
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}
            >
              {editing ? "Guardar" : "Crear"}
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default CreatePlace;
