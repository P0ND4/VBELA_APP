import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Switch,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { editData, push, remove } from "@features/helpers/informationSlice";
import { active } from "@features/function/informationSlice";
import Layout from "@components/Layout";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import TextStyle from "@components/TextStyle";
import theme from "@theme";
import { random } from "@helpers/libs";
import { addHelper, editHelper, removeHelper, getUser } from "@api";
import { socket } from "@socket";
import changeGeneralInformation from "@helpers/changeGeneralInformation";
import { writeFile } from "@helpers/offline";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateHelper = ({ navigation, route }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const helpers = useSelector((state) => state.helpers);

  const item = route.params.item;

  const [loading, setLoading] = useState(false);
  const [errorIdentifier, setErrorIdentifier] = useState(false);
  const [errorUser, setErrorUser] = useState(false);
  const [errorAccess, setErrorAccess] = useState(false);
  const [accessToReservations, setAccessToReservations] = useState(
    route.params.data === "Edit" ? item.accessToReservations : false
  );
  const [accessToStatistics, setAccessToStatistics] = useState(
    route.params.data === "Edit" ? item.accessToStatistics : false
  );
  const [accessToSupplier, setAccessToSupplier] = useState(
    route.params.data === "Edit" ? item.accessToSupplier : false
  );
  const [accessToCustomer, setAccessToCustomer] = useState(
    route.params.data === "Edit" ? item.accessToCustomer : false
  );
  const [accessToRoster, setAccessToRoster] = useState(
    route.params.data === "Edit" ? item.accessToRoster : false
  );
  const [accessToKitchen, setAccessToKitchen] = useState(
    route.params.data === "Edit" ? item.accessToKitchen : false
  );
  const [accessToTables, setAccessToTables] = useState(
    route.params.data === "Edit" ? item.accessToTables : false
  );
  const [accessToInventory, setAccessToInventory] = useState(
    route.params.data === "Edit" ? item.accessToInventory : false
  );

  const [accessToProductsAndServices, setAccessToProductsAndServices] =
    useState(
      route.params.data === "Edit" ? item.accessToProductsAndServices : false
    );

  const [inputUser, setInputUser] = useState(
    route.params.data === "Edit" ? item.user : ""
  );
  const [inputPassword, setInputPassword] = useState(
    route.params.data === "Edit" ? item.password : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (route.params.data === "Create")
      navigation.setOptions({ title: "Crear usuario" });
    else if (route.params.data === "Session")
      navigation.setOptions({ title: "Iniciar sesión" });
    else navigation.setOptions({ title: "Edición" });
  }, []);

  useEffect(() => {
    if (route.params.data !== "Create" && route.params.data !== "Edit")
      register("identifier", {
        value: "",
        required: true,
        validate: (text) =>
          text !== user.identifier || "No puede ingresar a su propio perfil.",
      });

    register("user", {
      value: route.params.data === "Edit" ? item.user : "",
      required: true,
    });
    register("password", {
      value: route.params.data === "Edit" ? item.password : "",
      required: true,
    });
    register("accessToReservations", {
      value: route.params.data === "Edit" ? item.accessToReservations : false,
    });
    register("accessToStatistics", {
      value: route.params.data === "Edit" ? item.accessToStatistics : false,
    });
    register("accessToSupplier", {
      value: route.params.data === "Edit" ? item.accessToSupplier : false,
    });
    register("accessToCustomer", {
      value: route.params.data === "Edit" ? item.accessToCustomer : false,
    });
    register("accessToRoster", {
      value: route.params.data === "Edit" ? item.accessToRoster : false,
    });
    register("accessToKitchen", {
      value: route.params.data === "Edit" ? item.accessToKitchen : false,
    });
    register("accessToTables", {
      value: route.params.data === "Edit" ? item.accessToTables : false,
    });
    register("accessToInventory", {
      value: route.params.data === "Edit" ? item.accessToInventory : false,
    });
    register("accessToProductsAndServices", {
      value:
        route.params.data === "Edit" ? item.accessToProductsAndServices : false,
    });
  }, []);

  const permissionValidation = (data) => {
    if (
      !data.accessToTables &&
      !data.accessToReservations &&
      !data.accessToStatistics &&
      !data.accessToSupplier &&
      !data.accessToRoster &&
      !data.accessToKitchen &&
      !data.accessToCustomer &&
      !data.accessToInventory
    )
      return true;
    else return false;
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    setErrorAccess(false);
    if (permissionValidation(data)) return setErrorAccess(true);

    data.id = random(20);
    data.expoID = [user.expoID];
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(push(data));
    navigation.pop();
    socket.emit("enter_room", { groups: [data.id] });
    await addHelper({
      identifier: user.identifier,
      helper: data,
      groups: helpers.map((h) => h.id),
    });
  };

  const onSubmitSingIn = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    setErrorIdentifier(false);
    setErrorUser(false);

    const u = await getUser({ identifier: data.identifier });

    if (!u.error) {
      const userFound = u.helpers.find((helper) => helper.user === data.user);

      if (userFound && userFound.password === data.password) {
        const groups = helpers.map((h) => h.id);

        if (groups.length > 0) socket.emit("leave", { groups });
        socket.emit("enter_room", { groups: [userFound.id] });

        if (!userFound.expoID.includes(user.expoID)) {
          if (user.expoID)
            userFound.expoID = [...userFound.expoID, user.expoID];
          await editHelper({
            identifier: u.identifier,
            helper: userFound,
            groups: [userFound.id],
          });
        }

        dispatch(
          active({
            ...userFound,
            identifier: data.identifier,
          })
        );

        await writeFile({ name: "user.json", value: user });
        changeGeneralInformation(dispatch, u);
        navigation.popToTop();
        const devices = userFound.expoID.filter(
          (expoID) => expoID !== user.expoID && expoID !== ""
        );

        if (devices.length !== 0) {
          await sendNotification({
            title: `Un usuario ingreso a ${data.user}`,
            body: `Usuario ingresado ${user.identifier}`,
            array: devices,
          });
        }
      } else setErrorUser(true);
    } else setErrorIdentifier(true);
  };

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    setErrorAccess(false);
    if (permissionValidation(data)) return setErrorAccess(true);

    data.modificationDate = new Date().getTime();
    data.creationDate = item.creationDate;
    data.expoID = [user.expoID];
    data.id = item.id;

    dispatch(editData({ id: item.id, data }));
    navigation.pop();

    await editHelper({
      identifier: user.identifier,
      helper: data,
      groups: helpers.map((h) => h.id),
    });
  };

  const deleteUser = () => {
    Keyboard.dismiss();
    Alert.alert(
      "¿Estás seguro que quieres eliminar la sesión?",
      "Los usuarios que esten utilizando esta sesión quedarán sin poderte ayudar",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            setLoading(true);
            socket.emit("close_room", { groups: [item.id] });
            dispatch(remove({ id: item.id }));
            navigation.pop();
            await removeHelper({
              identifier: user.identifier,
              id: item.id,
              groups: helpers.map((h) => h.id),
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
                {route.params.data === "Create"
                  ? "Crear usuario"
                  : route.params.data === "Session"
                  ? "Iniciar sesión"
                  : "Edición de usuarios"}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 20 }}>
              {route.params.data !== "Create" &&
                route.params.data !== "Edit" && (
                  <InputStyle
                    placeholder="Identificador al ingresar"
                    maxLength={40}
                    onChangeText={(text) => {
                      setValue("identifier", text.trim());
                    }}
                  />
                )}
              {(errors.identifier?.type || errorIdentifier) && (
                <TextStyle verySmall color={light.main2}>
                  {errors.identifier?.type === "required"
                    ? "El identificador de la cuenta es requerido"
                    : errors.identifier?.type === "validate"
                    ? errors.identifier?.message
                    : errorIdentifier
                    ? "El identificador de la cuenta no existe"
                    : ""}
                </TextStyle>
              )}
              <InputStyle
                value={inputUser}
                placeholder="Usuario"
                right={
                  inputUser
                    ? () => <TextStyle color={light.main2}>Usuario</TextStyle>
                    : null
                }
                maxLength={15}
                onChangeText={(text) => {
                  setValue("user", text.trim());
                  setInputUser(text.trim());
                }}
              />
              {errors.user?.type && (
                <TextStyle verySmall color={light.main2}>
                  El nombre del usuario es requerido
                </TextStyle>
              )}
              <InputStyle
                value={inputPassword}
                placeholder="Contraseña"
                secureTextEntry
                maxLength={50}
                onChangeText={(text) => {
                  setValue("password", text);
                  setInputPassword(text);
                }}
              />
              {errors.password?.type && (
                <TextStyle verySmall color={light.main2}>
                  La contraseña del usuario es requerida
                </TextStyle>
              )}
              {(route.params.data === "Create" ||
                route.params.data === "Edit") && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      VENTAS DIARIAS
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToTables(!accessToTables);
                        setValue("accessToTables", !accessToTables);
                      }}
                      value={accessToTables}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      PRODUCTOS Y SERVICIOS
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToProductsAndServices(
                          !accessToProductsAndServices
                        );
                        setValue(
                          "accessToProductsAndServices",
                          !accessToProductsAndServices
                        );
                      }}
                      value={accessToProductsAndServices}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      RESERVACIONES
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToReservations(!accessToReservations);
                        setValue("accessToReservations", !accessToReservations);
                      }}
                      value={accessToReservations}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      ESTADÍSTICAS
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToStatistics(!accessToStatistics);
                        setValue("accessToStatistics", !accessToStatistics);
                      }}
                      value={accessToStatistics}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      PROVEEDOR
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToSupplier(!accessToSupplier);
                        setValue("accessToSupplier", !accessToSupplier);
                      }}
                      value={accessToSupplier}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      CLIENTE
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToCustomer(!accessToCustomer);
                        setValue("accessToCustomer", !accessToCustomer);
                      }}
                      value={accessToCustomer}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      NÓMINA
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToRoster(!accessToRoster);
                        setValue("accessToRoster", !accessToRoster);
                      }}
                      value={accessToRoster}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      COCINA
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToKitchen(!accessToKitchen);
                        setValue("accessToKitchen", !accessToKitchen);
                      }}
                      value={accessToKitchen}
                    />
                  </View>
                  <View style={styles.toggles}>
                    <TextStyle smallParagraph color={light.main2}>
                      INVENTARIO
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToInventory(!accessToInventory);
                        setValue("accessToInventory", !accessToInventory);
                      }}
                      value={accessToInventory}
                    />
                  </View>
                </View>
              )}
            </View>
            <View>
              {errorAccess && (
                <TextStyle center verySmall color={light.main2}>
                  Debes concederle al menos un permiso
                </TextStyle>
              )}
              {errorUser && (
                <TextStyle center verySmall color={light.main2}>
                  Usuario o contraseña incorrecta
                </TextStyle>
              )}
              {route.params.data === "Edit" && (
                <ButtonStyle
                  onPress={() => {
                    if (loading) return;
                    deleteUser();
                  }}
                >
                  <TextStyle center>Eliminar usuario</TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor={light.main2}
                onPress={handleSubmit((data) => {
                  if (loading) return;
                  route.params.data === "Create"
                    ? onSubmitCreate(data)
                    : route.params.data === "Session"
                    ? onSubmitSingIn(data)
                    : onSubmitEdit(data);
                })}
              >
                <TextStyle center>
                  {route.params.data === "Create"
                    ? "Crear"
                    : route.params.data === "Session"
                    ? "Ingresar"
                    : "Guardar"}
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  toggles: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default CreateHelper;
