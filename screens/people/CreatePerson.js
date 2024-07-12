import { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard, Switch } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { add as addCustomer, edit as editCustomer } from "@features/people/customersSlice";
import { add as addSupplier, edit as editSupplier } from "@features/people/suppliersSlice";
import { random, thousandsSystem } from "@helpers/libs";
import { addPerson, editPerson } from "@api";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";

import theme from "@theme";

const { light, dark } = theme();

const CreatePerson = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);
  const suppliers = useSelector((state) => state.suppliers);

  const helperStatus = useSelector((state) => state.helperStatus);

  const type = route.params?.type;
  const editing = route.params?.editing;
  const dataP = route.params?.person;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editing ? dataP.name : "");
  const [identification, setIdentification] = useState(
    editing ? thousandsSystem(dataP.identification) : ""
  );
  const [address, setAddress] = useState(editing ? dataP.address : "");
  const [phoneNumber, setPhoneNumber] = useState(editing ? dataP.phoneNumber : "");
  const [special, setSpecial] = useState(editing ? dataP.special : false);

  const dispatch = useDispatch();

  useEffect(() => {
    register("name", { value: editing ? dataP.name : "", required: true });
    register("identification", { value: editing ? dataP.identification : "" });
    if (type === "customer") register("special", { value: editing ? dataP.special : false });
    register("address", { value: editing ? dataP.address : "" });
    register("phoneNumber", { value: editing ? dataP.phoneNumber : "" });

    navigation.setOptions({
      title: type === "supplier" ? "Crear Proveedor" : "Crear Cliente",
    });
  }, []);

  const eventHandler = (value) => {
    register("clientList", { value: editing && value ? dataP.clientList : [] });
  };

  useEffect(() => {
    if (type === "customer") eventHandler(editing ? dataP.special : false);
  }, []);

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (type === "customer" && customers.find((p) => p.id === id)) return onSubmitCreate(data);
    if (type === "supplier" && suppliers.find((p) => p.id === id)) return onSubmitCreate(data);

    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();

    if (type === "customer") {
      if (data.special) dispatch(addCustomer(data));
      else {
        delete data.clientList;
        dispatch(addCustomer(data));
      }
    }
    if (type === "supplier") dispatch(addSupplier(data));
    navigation.pop();
    await addPerson({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      person: { type, data },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    data.modificationDate = new Date().getTime();
    data.id = dataP.id;
    data.creationDate = dataP.creationDate;
    if (type === "customer") {
      if (data.special) dispatch(editCustomer({ id: dataP.id, data }));
      else {
        delete data.clientList;
        dispatch(editCustomer({ id: dataP.id, data }));
      }
    }
    if (type === "supplier") dispatch(editSupplier({ id: dataP.id, data }));
    navigation.pop();

    await editPerson({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      person: { type, data },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  return (
    <Layout style={styles.layout}>
      <View>
        <TextStyle bigTitle center color={light.main2}>
          VBELA
        </TextStyle>
        <TextStyle bigParagraph center color={mode === "light" ? null : dark.textWhite}>
          Crear nuevo {type === "supplier" ? "proveedor" : "cliente"}
        </TextStyle>
      </View>
      <View style={{ marginVertical: 20, width: "100%" }}>
        {type === "customer" && !editing && (
          <View>
            <View style={styles.row}>
              <TextStyle smallParagraph color={light.main2}>
                MODO AGENCIA
              </TextStyle>
              <Switch
                trackColor={{ false: dark.main2, true: light.main2 }}
                thumbColor={light.main4}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) => {
                  setSpecial(value);
                  setValue("special", value);
                  eventHandler(value);
                }}
                value={special}
              />
            </View>
          </View>
        )}
        <InputStyle
          placeholder={!special ? "Nombre" : "Nombre de la agencia"}
          maxLength={50}
          value={name}
          right={name ? () => <TextStyle color={light.main2}>Nombre</TextStyle> : null}
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
          placeholder="Identificación"
          value={identification}
          maxLength={15}
          right={identification ? () => <TextStyle color={light.main2}>Identificación</TextStyle> : null}
          keyboardType="numeric"
          onChangeText={(text) => {
            setValue("identification", text.replace(/[^0-9]/g, ""));
            setIdentification(thousandsSystem(text.replace(/[^0-9]/g, "")));
          }}
        />
        <InputStyle
          placeholder="Dirección"
          maxLength={100}
          value={address}
          right={address ? () => <TextStyle color={light.main2}>Dirección</TextStyle> : null}
          onChangeText={(text) => {
            setValue("address", text);
            setAddress(text);
          }}
        />
        <InputStyle
          placeholder="Número de teléfono"
          maxLength={18}
          value={phoneNumber}
          keyboardType="phone-pad"
          right={phoneNumber ? () => <TextStyle color={light.main2}>Teléfono</TextStyle> : null}
          onChangeText={(text) => {
            setValue("phoneNumber", text);
            setPhoneNumber(text);
          }}
        />
      </View>
      <ButtonStyle
        onPress={handleSubmit((data) => {
          if (loading) return;
          !editing ? onSubmitCreate(data) : onSubmitEdit(data);
        })}
        backgroundColor={light.main2}
      >
        <TextStyle center>{editing ? "Guardar" : "Crear"}</TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

const styles = StyleSheet.create({
  layout: {
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CreatePerson;
