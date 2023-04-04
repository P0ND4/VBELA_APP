import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import {
  addDays,
  changeDate,
  months,
  random,
  thousandsSystem,
} from "../helpers/libs";
import { add, edit } from "../features/groups/reservationsSlice";
import { addReservation, editReservation } from "../api";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import InputStyle from "../components/InputStyle";
import ButtonStyle from "../components/ButtonStyle";
import theme from "../theme";
import helperNotification from "../helpers/helperNotification";

const light = theme.colors.light;
const dark = theme.colors.dark;

const ReserveScreen = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const nomenclature = useSelector((state) =>
    state.nomenclatures.find((n) => n.id === route.params.id)
  );
  const reservations = useSelector((state) =>
    state.reservations.filter((r) => r.id === route.params.id)
  );
  const reserve = useSelector((state) =>
    state.reservations.find((r) => r.ref === route.params.ref)
  );
  const activeGroup = useSelector((state) => state.activeGroup);
  const editing = route.params.editing;

  const [fullName, setFullName] = useState(editing ? reserve.fullName : "");
  const [identification, setIdentification] = useState(
    editing ? thousandsSystem(reserve.identification) : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    editing ? reserve.phoneNumber : ""
  );
  const [people, setPeople] = useState(editing ? reserve.people : "");
  const [days, setDays] = useState(editing ? reserve.days : "");
  const [amount, setAmount] = useState("");
  const [amountWithDiscount, setAmountWithDiscount] = useState("");
  const [email, setEmail] = useState(editing ? reserve.email : "");
  const [discount, setDiscount] = useState(editing ? reserve.discount : "");

  const dispatch = useDispatch();

  useEffect(() => {
    const amount = people * nomenclature.value * days;

    if (discount) {
      setAmount(Math.floor(amount - amount * (discount / 100)));
      setAmountWithDiscount(Math.floor(amount * (discount / 100)));
    } else setAmount(amount);
  }, [people, days, discount]);

  useEffect(() => {
    register("discount", {
      value: editing ? reserve.discount : "",
    });
    register("fullName", {
      value: editing ? reserve.fullName : "",
      required: true,
    });
    register("email", {
      value: editing ? reserve.email : "",
    });
    register("identification", {
      value: editing ? reserve.identification : "",
    });
    register("phoneNumber", { value: editing ? reserve.phoneNumber : "" });
    register("people", {
      value: editing ? reserve.people : "",
      required: true,
      validate: {
        capability: (num) =>
          parseInt(num) <= parseInt(route.params.capability) ||
          `Excede el límite de ${route.params.capability} personas`,
        zero: (num) => num > 0 || "Digíte cuantas personas va a reservar",
      },
    });
    register("days", {
      value: editing ? reserve.days : "",
      required: true,
      validate: {
        zero: (num) => num > 0 || "Digíte los dias a reservar",
        days: (num) => {
          const day = route.params.day;
          const month = months.indexOf(route.params.month);
          const year = route.params.year;

          for (let i = 0; i < parseInt(num); i++) {
            const endDay = addDays(new Date(year, month, day), parseInt(i));

            const currentReservations = editing
              ? reservations.filter((r) => r.ref !== reserve.ref)
              : reservations;

            for (let reserve of currentReservations) {
              const start = new Date(reserve.start);
              const end = new Date(reserve.end);

              if (endDay >= start && endDay <= end)
                return `El número de días choca con esta fecha reservada: ${changeDate(
                  endDay
                )} sólo alcanza para reservar ${i} ${i === 1 ? "día" : "días"}`;
            }
          }
        },
      },
    });
  }, []);

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();
    const date = new Date(reserve.start);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

    data.ref = reserve.ref;
    data.start = reserve.start;
    data.id = reserve.id;
    data.end = end.getTime();
    data.amount = amount;
    data.creationDate = reserve.creationDate;
    data.modificationDate = new Date().getTime();

    dispatch(edit({ ref: reserve.ref, data }));
    navigation.pop();
    await editReservation({
      email: activeGroup.active ? activeGroup.email : user.email,
      reservation: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      activeGroup,
      user,
      "Reservación editada",
      `Una reservación ha sido editada por ${user.email}`
    );
  };

  const onSubmitCreate = async (data) => {
    Keyboard.dismiss();
    const ref = random(10, { number: true });
    const exists = reservations.find((re) => re.ref === ref);
    if (exists) return onSubmitCreate(data);

    const day = route.params.day;
    const month = months.indexOf(route.params.month);
    const year = route.params.year;

    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

    data.start = new Date(year, month, day).getTime();
    data.end = end.getTime();
    data.amount = amount;
    data.id = route.params.id;
    data.ref = ref;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    navigation.pop();
    await addReservation({
      email: activeGroup.active ? activeGroup.email : user.email,
      reservation: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      activeGroup,
      user,
      "Reservación creada",
      `Una reservación ha sido creada por ${user.email}`
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
            <View style={{ width: "100%" }}>
              <View style={styles.header}>
                <TextStyle
                  smallTitle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {route.params.month} {("0" + route.params.day).slice(-2)}
                </TextStyle>
                <TextStyle smallTitle color={light.main2}>
                  {route.params.year}
                </TextStyle>
              </View>
              <TextStyle
                bigParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {route.params.name}
              </TextStyle>
            </View>
            <View style={{ marginVertical: 30 }}>
              <InputStyle
                value={fullName}
                placeholder="Nombre Completo"
                maxLength={30}
                onChangeText={(text) => {
                  setValue("fullName", text);
                  setFullName(text);
                }}
              />
              {errors.fullName?.type && (
                <TextStyle verySmall color={light.main2}>
                  Nombre completo obligatorio
                </TextStyle>
              )}
              <InputStyle
                value={email}
                placeholder="Correo electrónico"
                maxLength={40}
                onChangeText={(text) => {
                  setValue("email", text);
                  setEmail(text);
                }}
              />
              <InputStyle
                value={identification}
                placeholder="Cédula"
                maxLength={15}
                keyboardType="numeric"
                onChangeText={(text) => {
                  setValue("identification", text.replace(/[^0-9]/g, ""));
                  setIdentification(
                    thousandsSystem(text.replace(/[^0-9]/g, ""))
                  );
                }}
              />
              <InputStyle
                value={phoneNumber}
                placeholder="Número de teléfono"
                keyboardType="numeric"
                maxLength={15}
                onChangeText={(text) => {
                  setValue("phoneNumber", text);
                  setPhoneNumber(text);
                }}
              />
              <InputStyle
                placeholder="Cantidad de personas"
                keyboardType="numeric"
                value={people}
                onChangeText={(num) => {
                  setPeople(num.replace(/[^0-9]/g, ""));
                  setValue("people", num);
                }}
                maxLength={3}
              />
              {errors.people?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.people.type === "required"
                    ? "Digíte cuantas personas va a reservar"
                    : errors.people.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Número de días"
                keyboardType="numeric"
                value={days}
                onChangeText={(num) => {
                  setDays(num.replace(/[^0-9]/g, ""));
                  setValue("days", num);
                }}
                maxLength={3}
              />
              {errors.days?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.days.type === "required"
                    ? "Digíte los dias a reservar"
                    : errors.days.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Descuento (En porcentaje)"
                value={discount}
                maxLength={3}
                keyboardType="numeric"
                onChangeText={(text) => {
                  if (text > 100) return;
                  setValue("discount", text);
                  setDiscount(text.replace(/[^0-9]/g, ""));
                }}
              />
            </View>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Total a pagar:{" "}
              <TextStyle color={light.main2} smallSubtitle>
                {thousandsSystem(amount)}
              </TextStyle>
            </TextStyle>
            {discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Descuento del {discount}%:{" "}
                <TextStyle color={light.main2} smallSubtitle>
                  {thousandsSystem(amountWithDiscount)}
                </TextStyle>
              </TextStyle>
            )}
            <ButtonStyle
              style={{ marginTop: 30 }}
              backgroundColor={light.main2}
              onPress={handleSubmit(editing ? onSubmitEdit : onSubmitCreate)}
            >
              {editing ? "Guardar" : "Reservar"}
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default ReserveScreen;
