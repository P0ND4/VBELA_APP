import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  add as addCustomer,
  edit as editCustomer,
} from "@features/people/customersSlice";
import {
  add as addSupplier,
  edit as editSupplier,
} from "@features/people/suppliersSlice";
import { edit as editE } from "@features/function/economySlice";
import { random, thousandsSystem, getFontSize } from "@helpers/libs";
import { addPerson, editPerson, editEconomy } from "@api";
import AddPerson from "@components/AddPerson";
import Information from '@components/Information';
import Ionicons from "@expo/vector-icons/Ionicons";
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

  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );

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
  const [activeInformation, setActiveInformation] = useState(false);
  const [special, setSpecial] = useState(editing ? dataP.special : false);
  const [modalVisible, setModalVisible] = useState(false);
  const [completeClientList, setCompleteClientList] = useState(editing ? dataP.clientList : []);
  const [clientList, setClientList] = useState([]);
  const [checkOutClientList, setCheckOutClientList] = useState([]);
  const [clientCountFinished, setClientCountFinished] = useState(null);

  useEffect(() => {
    if (editing && special && dataP?.clientList) {
      const separateClients = ({ c, isCheckOut }) =>{
        const exists =
          standardReservations.some((s) =>
            s.hosted.some((h) => h.owner === c.id && h.checkOut)
          ) ||
          accommodationReservations.some((h) => h.owner === c.id && h.checkOut);

        return isCheckOut ? exists : !exists;
      }

      const clientList = dataP.clientList?.filter((c) => separateClients({ c, isCheckOut: false }));
      const checkOutClientList = dataP.clientList?.filter((c) => separateClients({ c, isCheckOut: true }));

      const count = dataP?.clientList.length - clientList.length;
      setClientCountFinished(count || null);
      setClientList(clientList);
      setCheckOutClientList(checkOutClientList);
    }
  }, [editing, special, dataP?.clientList]);

  const [editingClient, setEditingClient] = useState({
    key: Math.random(),
    active: false,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    register("name", { value: editing ? dataP.name : "", required: true });
    register("identification", { value: editing ? dataP.identification : "" });
    if (type === "customer")
      register("special", { value: editing ? dataP.special : false });

    navigation.setOptions({
      title: type === "supplier" ? "Crear Proveedor" : "Crear Cliente",
    });
  }, []);

  const eventHandler = (value) => {
    register("clientList", {
      value: editing && value ? dataP.clientList : [],
      validate: (array) => {
        if (value)
          return array.length > 0 || "Tiene que haber mínimo 1 cliente";
      },
    });
  };

  useEffect(() => {
    if (type === "customer") eventHandler(editing ? dataP.special : false);
  }, []);

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(20);
    if (type === "customer" && customers.find((p) => p.id === id))
      return onSubmitCreate(data);
    if (type === "supplier" && suppliers.find((p) => p.id === id))
      return onSubmitCreate(data);

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
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      person: { type, data },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
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
    data.creationDate = dataP.creationDate;
    if (type === "customer") {
      if (data.special) dispatch(editCustomer({ id: dataP.id, data }));
      else {
        delete data.clientList;
        dispatch(editCustomer({ id: dataP.id, data }));
      }
    }
    if (type === "supplier")
      dispatch(editSupplier({ id: dataP.id, data }));
    navigation.pop();

    await editPerson({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      person: { type, data },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const updateHosted = ({ data, cleanData }) => {
    const obj = {
      id: editingClient.id,
      name: data.fullName,
      identification: data.identification,
    };

    const validation = (h) => {
      if (h.id === editingClient.id) return obj;
      return h;
    }

    const newArrayCompleteClientList = completeClientList.map(validation);
    setCompleteClientList(newArrayCompleteClientList)
    setCheckOutClientList(checkOutClientList.map(validation))
    setClientList(clientList.map(validation));
    setValue("clientList", newArrayCompleteClientList);
    cleanData();
  };

  const saveHosted = ({ data: { fullName, identification }, cleanData }) => {
    const id = random(10, { number: true });
    const newDate = { id, name: fullName, identification };
    setCompleteClientList([...completeClientList, newDate])
    setClientList([...clientList, newDate]);
    setValue("clientList", [...completeClientList, newDate]);
    cleanData();
  };

  const SubClient = ({ item }) => {
    return <View
    key={item.id}
    style={[
      styles.row,
      {
        marginVertical: 4,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor:
          mode === "light" ? light.main5 : dark.main2,
        borderRadius: 8,
      },
    ]}
  >
    <TextStyle
      color={mode === "light" ? light.textDark : dark.textWhite}
    >
      {`${item?.name?.slice(0, 20)}${
        item?.name?.length > 20 ? "..." : ""
      }`}
    </TextStyle>
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={() => {
          setEditingClient({
            key: Math.random(),
            active: true,
            ...item,
            fullName: item.name,
          });
          setModalVisible(!modalVisible);
        }}
      >
        <Ionicons
          name="create-outline"
          size={getFontSize(19)}
          style={{ marginHorizontal: 4 }}
          color={
            mode === "light" ? light.textDark : dark.textWhite
          }
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Eliminar",
            `¿Quieres eliminar el cliente ${item.name}?`,
            [
              {
                text: "No",
                style: "cancel",
              },
              {
                text: "Si",
                onPress: async () => {
                  const validation = (h) => h.id !== item.id;
                  const newArrayClientList = clientList.filter(validation);
                  const newArrayCompleteClientList = completeClientList.filter(validation);
                  const newArrayCheckOutClientList = checkOutClientList.filter(validation);
                  setClientList(newArrayClientList);
                  setCompleteClientList(newArrayCompleteClientList);
                  setCheckOutClientList(newArrayCheckOutClientList);
                  if (!newArrayCheckOutClientList.length) {
                    setActiveInformation(false);
                    setClientCountFinished(null);
                  }
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <Ionicons
          name="trash"
          size={getFontSize(19)}
          style={{ marginHorizontal: 4 }}
          color={
            mode === "light" ? light.textDark : dark.textWhite
          }
        />
      </TouchableOpacity>
    </View>
  </View>
  }

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
        {type === "customer" && (
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
                  setValue("name", "");
                  setValue(
                    "identification",
                    !value && editing ? dataP.identification : ""
                  );
                  setName("");
                  setIdentification(
                    !value && editing ? dataP.identification : ""
                  );
                  setEditingClient({
                    key: Math.random(),
                    active: false,
                  });
                  eventHandler(value);
                }}
                value={special}
              />
            </View>
            {editing && clientCountFinished && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextStyle smallParagraph color={light.main2}>
                  {clientCountFinished} PERSONA
                  {clientCountFinished === 1 ? "" : "S"} HA
                  {clientCountFinished === 1 ? "" : "N"} HECHO CHECK OUT
                </TextStyle>
                <TouchableOpacity
                  onPress={() => setActiveInformation(!activeInformation)}
                >
                  <Ionicons
                    name="help-circle-outline"
                    style={{ marginLeft: 5 }}
                    size={getFontSize(23)}
                    color={light.main2}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {special && (
          <ScrollView
            style={{ maxHeight: 220, marginTop: 5 }}
            showsVerticalScrollIndicator={false}
          >
            {clientList.map((item) => <SubClient item={item} key={item.id}/>)}
          </ScrollView>
        )}
        {special && (
          <ButtonStyle
            backgroundColor={light.main2}
            style={[
              styles.row,
              {
                justifyContent: "center",
              },
            ]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <TextStyle>Agregar persona</TextStyle>
            <Ionicons
              name="person-add"
              color={light.textDark}
              size={getFontSize(16)}
              style={{ marginLeft: 10 }}
            />
          </ButtonStyle>
        )}
        {special && errors.clientList?.type && (
          <TextStyle verySmall color={light.main2}>
            {errors.clientList?.message}
          </TextStyle>
        )}
        <InputStyle
          placeholder={!special ? "Nombre" : "Nombre de la agencia"}
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
          placeholder={special ? "Identificación" : "Cédula"}
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
      <Information
        modalVisible={activeInformation}
        setModalVisible={setActiveInformation}
        style={{ backgroundColor: mode === "light" ? light.main4 : dark.main1 }}
        title="CHECK OUT"
        content={() => (
          <View>
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Lista de personas que han hecho CHECK OUT
            </TextStyle>
            <ScrollView
              style={{ maxHeight: 220, marginTop: 15 }}
              showsVerticalScrollIndicator={false}
            >
              {checkOutClientList.map((item) => <SubClient item={item} key={item.id}/>)}
            </ScrollView>
          </View>
        )}
      />
      <AddPerson
        key={editingClient.key}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        settings={{
          email: false,
          phoneNumber: false,
          country: false,
          days: false,
          checkIn: false,
          discount: false,
        }}
        editing={editingClient}
        setEditing={setEditingClient}
        handleSubmit={(data) => {
          if (editingClient.active) updateHosted(data);
          else saveHosted(data);
        }}
        subtitle="Añade un cliente"
      />
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
