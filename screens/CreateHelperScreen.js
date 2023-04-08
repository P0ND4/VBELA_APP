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
import { editData, push, remove } from "../features/helpers/informationSlice";
import { active } from "../features/function/informationSlice";
import Layout from "../components/Layout";
import InputStyle from "../components/InputStyle";
import ButtonStyle from "../components/ButtonStyle";
import TextStyle from "../components/TextStyle";
import theme from "../theme";
import { random } from "../helpers/libs";
import { addHelper, editHelper, removeHelper, getUser } from "../api";
import { socket } from "../socket";
import changeGeneralInformation from "../helpers/changeGeneralInformation";
import { writeFile } from "../helpers/offline";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateGroup = ({ navigation, route }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);

  const item = route.params.item;

  const [errorEmail, setErrorEmail] = useState(false);
  const [errorUser, setErrorUser] = useState(false);
  const [errorAccess, setErrorAccess] = useState(false);
  const [accessToTables, setAccessToTables] = useState(
    route.params.data === "Edit" ? item.accessToTables : false
  );
  const [accessToReservations, setAccessToReservations] = useState(
    route.params.data === "Edit" ? item.accessToReservations : false
  );
  const [accessToStatistics, setAccessToStatistics] = useState(
    route.params.data === "Edit" ? item.accessToStatistics : false
  );
  const [accessToEconomy, setAccessToEconomy] = useState(
    route.params.data === "Edit" ? item.accessToEconomy : false
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
      register("email", {
        value: "",
        required: true,
        pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/,
        validate: (text) =>
          text !== user.email || "No puede ingresar a su propio perfil.",
      });

    register("user", {
      value: route.params.data === "Edit" ? item.user : "",
      required: true,
    });
    register("password", {
      value: route.params.data === "Edit" ? item.password : "",
      required: true,
    });
    register("accessToTables", {
      value: route.params.data === "Edit" ? item.accessToTables : false,
    });
    register("accessToReservations", {
      value: route.params.data === "Edit" ? item.accessToReservations : false,
    });
    register("accessToStatistics", {
      value: route.params.data === "Edit" ? item.accessToStatistics : false,
    });
    register("accessToEconomy", {
      value: route.params.data === "Edit" ? item.accessToEconomy : false,
    });
  }, []);

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    setErrorAccess(false);
    if (
      !data.accessToTables &&
      !data.accessToReservations &&
      !data.accessToStatistics &&
      !data.accessToEconomy
    )
      return setErrorAccess(true);

    data.id = random(20);
    data.expoID = [user.expoID];
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(push(data));
    navigation.pop();
    socket.emit("connected", { groups: [data.id] });
    await addHelper({
      email: user.email,
      helper: data,
      groups: user.helpers.map((h) => h.id),
    });
  };

  const onSubmitSingIn = async (data) => {
    Keyboard.dismiss();
    setErrorEmail(false);
    setErrorUser(false);

    const u = await getUser({ email: data.email });

    if (!u.error) {
      const userFound = u.helpers.find((helper) => helper.user === data.user);

      if (userFound && userFound.password === data.password) {
        if (!userFound.expoID.includes(user.expoID)) {
          if (user.expoID)
            userFound.expoID = [...userFound.expoID, user.expoID];
          await editHelper({ email: u.email, helper: userFound });
        }
        const groups = user.helpers.map((h) => h.id);

        if (groups.length > 0) socket.emit("leave", { groups });
        socket.emit("connected", { groups: [userFound.id] });

        dispatch(
          active({
            ...userFound,
            email: data.email,
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
            body: `Correo ingresado ${user.email}`,
            array: devices,
          });
        }
      } else setErrorUser(true);
    } else setErrorEmail(true);
  };

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();
    setErrorAccess(false);
    if (
      !data.accessToTables &&
      !data.accessToReservations &&
      !data.accessToStatistics &&
      !data.accessToEconomy
    )
      return setErrorAccess(true);

    data.modificationDate = new Date().getTime();
    data.creationDate = item.creationDate;
    data.expoID = [user.expoID];
    data.id = item.id;

    dispatch(editData({ id: item.id, data }));
    navigation.pop();

    await editHelper({
      email: user.email,
      helper: data,
      groups: user.helpers.map((h) => h.id),
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
            socket.emit("close_room", { groups: [item.id] });
            dispatch(remove({ id: item.id }));
            navigation.pop();
            await removeHelper({
              email: user.email,
              id: item.id,
              groups: user.helpers.map((h) => h.id),
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
            <View style={{ marginVertical: 30 }}>
              {route.params.data !== "Create" &&
                route.params.data !== "Edit" && (
                  <InputStyle
                    placeholder="Correo al ingresar"
                    maxLength={40}
                    keyboardType="email-address"
                    onChangeText={(text) => {
                      setValue("email", text);
                    }}
                  />
                )}
              {(errors.email?.type || errorEmail) && (
                <TextStyle verySmall color={light.main2}>
                  {errors.email?.type === "required"
                    ? "El correo es requerido"
                    : errors.email?.type === "pattern"
                    ? "El correo es invalido"
                    : errors.email?.type === "validate"
                    ? errors.email?.message
                    : errorEmail
                    ? "El correo no existe"
                    : ""}
                </TextStyle>
              )}
              <InputStyle
                value={inputUser}
                placeholder="Usuario"
                right={inputUser ? () => <TextStyle color={light.main2}>Usuario</TextStyle> : null}
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
                      Acceso al consumo
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
                      Acceso a reservaciones
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
                      Acceso a estadísticas
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
                      Acceso a COMPRA y GASTO
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setAccessToEconomy(!accessToEconomy);
                        setValue("accessToEconomy", !accessToEconomy);
                      }}
                      value={accessToEconomy}
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
                <ButtonStyle onPress={() => deleteUser()}>
                  Eliminar usuario
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor={light.main2}
                onPress={handleSubmit(
                  route.params.data === "Create"
                    ? onSubmitCreate
                    : route.params.data === "Session"
                    ? onSubmitSingIn
                    : onSubmitEdit
                )}
              >
                {route.params.data === "Create"
                  ? "Crear"
                  : route.params.data === "Session"
                  ? "Ingresar"
                  : "Guardar"}
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

export default CreateGroup;
