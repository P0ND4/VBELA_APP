import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addEconomy, addReservation, editReservation, editEconomy } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { add as addE, edit as editE } from "@features/function/economySlice";
import { add as addR, edit as editR } from "@features/groups/reservationsSlice";
import helperNotification from "@helpers/helperNotification";
import {
  addDays,
  changeDate,
  months,
  random,
  thousandsSystem,
} from "@helpers/libs";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateReserve = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const reservationsState = useSelector((state) => state.reservations);
  const economy = useSelector((state) => state.economy);
  const folk = useSelector((state) => state.people);
  const activeGroup = useSelector((state) => state.activeGroup);
  const editing = route.params.editing;
  const owner = route.params?.owner;
  const reserve = route.params?.reserve;

  const [nomenclature, setNomenclature] = useState([]);
  const [reservations, setReservations] = useState([]);

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
  const [discount, setDiscount] = useState(
    editing ? thousandsSystem(reserve.discount) : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setReservations(reservationsState.filter((r) => r.id === route.params.id));
    setNomenclature(nomenclaturesState.find((n) => n.id === route.params.id));
  }, [route.params]);

  useEffect(() => {
    setDiscount('');
    setValue('discount','');
  },[people,days]);

  useEffect(() => {
    const amount = people * nomenclature.value * days;

    setAmount(amount);
    if (discount)
      setAmountWithDiscount(amount - discount.replace(/[^0-9]/g, ""));
  }, [people, days, discount, nomenclature]);

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

  const manageEconomy = async ({ editing }) => {
    const ownerRef = reserve?.owner ? reserve.owner : owner;
    const foundEconomy = economy.find((e) => e.ref === ownerRef);

    if (!foundEconomy) {
      const id = random(20);
      const person = folk.find((p) => p.id === ownerRef);

      const newEconomy = {
        id,
        ref: ownerRef,
        owner: {
          identification: person.identification,
          name: person.name,
        },
        type: "debt",
        amount: discount.length > 0 ? amountWithDiscount : amount,
        name: `Deuda ${person.name}`,
        payment: 0,
        creationDate: new Date().getTime(),
        modificationDate: new Date().getTime(),
      };

      dispatch(addE(newEconomy));
      await addEconomy({
        email: activeGroup.active ? activeGroup.email : user.email,
        economy: newEconomy,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    } else {
      const currentEconomy = { ...foundEconomy };
      if (editing) {
        currentEconomy.amount -= reserve?.discount
          ? reserve.amount - parseInt(reserve.discount)
          : reserve.amount;
      }
      currentEconomy.amount +=
        discount.length > 0 ? parseInt(amountWithDiscount) : amount;
      currentEconomy.modificationDate = new Date().getTime();
      dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
      await editEconomy({
        email: activeGroup.active ? activeGroup.email : user.email,
        economy: currentEconomy,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  const onSubmitEdit = async (data) => {
    Keyboard.dismiss();

    const date = new Date(reserve.start);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

    data.owner = reserve.owner;
    data.ref = reserve.ref;
    data.start = reserve.start;
    data.id = reserve.id;
    data.end = end.getTime();
    data.amount = amount;
    data.creationDate = reserve.creationDate;
    data.modificationDate = new Date().getTime();

    dispatch(editR({ ref: reserve.ref, data }));
    navigation.pop();
    if (reserve.owner) await manageEconomy({ editing: true });
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
      `Una reservación ha sido editada por ${days} días, por el usuario ${
        user.email
      }, desde ${changeDate(new Date(data.start))} hasta ${changeDate(
        new Date(data.end)
      )}`,
      "accessToReservations"
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
    data.owner = owner;
    data.id = route.params.id;
    data.ref = ref;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(addR(data));
    navigation.pop();
    if (owner) await manageEconomy({ editing: false });
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
      `Una reservación de ${days} días ha sido creada por ${
        user.email
      } desde ${changeDate(new Date(data.start))} hasta ${changeDate(
        new Date(data.end)
      )}`,
      "accessToReservations"
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
                right={
                  fullName
                    ? () => <TextStyle color={light.main2}>Nombre</TextStyle>
                    : null
                }
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
                right={
                  email
                    ? () => <TextStyle color={light.main2}>Correo</TextStyle>
                    : null
                }
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
                right={
                  identification
                    ? () => <TextStyle color={light.main2}>Cédula</TextStyle>
                    : null
                }
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
                right={
                  phoneNumber
                    ? () => <TextStyle color={light.main2}>Teléfono</TextStyle>
                    : null
                }
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
                right={
                  people
                    ? () => <TextStyle color={light.main2}>Personas</TextStyle>
                    : null
                }
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
                right={
                  days
                    ? () => <TextStyle color={light.main2}>Días</TextStyle>
                    : null
                }
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
                placeholder="Descuento (En valor)"
                value={discount}
                right={
                  discount
                    ? () => <TextStyle color={light.main2}>Descuento</TextStyle>
                    : null
                }
                keyboardType="numeric"
                onChangeText={(text) => {
                  const value = text.replace(/[^0-9]/g, "");

                  if (value > amount) return;
                  setValue("discount", value);
                  setDiscount(thousandsSystem(value));
                }}
              />
            </View>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Total{!discount ? " a pagar" : ""}:{" "}
              <TextStyle color={light.main2} smallSubtitle>
                {thousandsSystem(amount)}
              </TextStyle>
            </TextStyle>
            {discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Descuento:{" "}
                <TextStyle color={light.main2} smallSubtitle>
                  {discount}
                </TextStyle>
              </TextStyle>
            )}
            {discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Total a pagar:{" "}
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

export default CreateReserve;
