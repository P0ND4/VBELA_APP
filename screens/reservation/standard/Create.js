import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addReservation, editReservation } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import {
  add as addRS,
  edit as editRS,
} from "@features/zones/standardReservationsSlice";
import helperNotification from "@helpers/helperNotification";
import { Hosted, AddHosted } from "@utils/reservation/create/HostedEvent";
import FinalInformation from "@utils/reservation/create/FinalInformation";
import Header from "@utils/reservation/create/Header";
import {
  addDays,
  changeDate,
  random,
  thousandsSystem,
  getFontSize,
} from "@helpers/libs";
import theme from "@theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const { light } = theme();

const CreateReserve = ({ route, navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const user = useSelector((state) => state.user);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const helperStatus = useSelector((state) => state.helperStatus);

  const personStaying = route.params?.hosted;

  const editing = route.params?.editing;
  const reserve = route.params?.reserve;
  const place = route.params?.place;
  const { day, month, year } = route.params?.date;

  const [loading, setLoading] = useState(false);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);

  const [hosted, setHosted] = useState(
    editing ? reserve.hosted : personStaying || []
  );

  const [editingHosted, setEditingHosted] = useState({
    key: Math.random(),
    active: false,
  });

  const [days, setDays] = useState(editing ? String(reserve.days) : "");
  const [amount, setAmount] = useState("");
  const [amountWithDiscount, setAmountWithDiscount] = useState("");
  const [discount, setDiscount] = useState(
    editing ? thousandsSystem(reserve.discount || "") : ""
  );

  const [nomenclauture, setNomenclature] = useState(null);

  useEffect(() => {
    setNomenclature(nomenclatures.find((n) => n.id === place.id));
  }, [place, nomenclatures]);

  const dispatch = useDispatch();

  useEffect(() => {
    const amount = nomenclauture?.value * days;

    setAmount(amount);
    if (discount)
      setAmountWithDiscount(amount - discount.replace(/[^0-9]/g, ""));
  }, [hosted.length, days, discount, nomenclauture]);

  useEffect(() => {
    register("hosted", {
      value: editing ? reserve.hosted : personStaying || [],
      validate: {
        min: (value) => value.length > 0 || "Tiene que haber mínimo 1 huésped",
      },
    });
    register("payment", { value: editing ? reserve.payment : [] });
    register("status", { value: editing ? reserve.status : null });
    register("discount", { value: editing ? reserve.discount : null });

    register("days", {
      value: editing ? reserve.days : "",
      required: true,
      validate: {
        zero: (num) => num > 0 || "Digíte los dias a reservar",
        days: (num) => {
          const reservations = standardReservations.filter(
            (r) => r.id !== reserve?.id && r.ref === place.id
          );

          const startDate = new Date(year, month, day);
          const endDate = addDays(new Date(year, month, day), num - 1);

          const exists = reservations.find((reserva) => {
            const start = new Date(reserva.start);
            const end = new Date(reserva.end);

            return (
              (startDate >= start && startDate <= end) ||
              (endDate >= start && endDate <= end) ||
              (start >= startDate && end <= endDate)
            );
          });

          const days =
            Math.floor(
              (new Date(exists?.start) - startDate) / (1000 * 60 * 60 * 24)
            ) + 1;

          return (
            !exists ||
            `El número de días choca con una fecha reservada: ${changeDate(
              new Date(exists.start)
            )} sólo alcanza para reservar ${days - 1} ${
              days === 2 ? "día" : "días"
            }`
          );
        },
      },
    });
  }, []);

  const cleanDiscount = () => {
    setDiscount("");
    setValue("discount", null);
  };

  const onSubmitEdit = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const date = new Date(reserve.start);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));

    data.id = reserve.id;
    data.ref = reserve.ref;
    data.type = "standard";
    data.start = reserve.start;
    data.end = end.getTime();
    data.amount = amount;
    data.total = data.discount ? amount - data.discount : amount;
    data.creationDate = reserve.creationDate;
    data.modificationDate = new Date().getTime();

    dispatch(editRS({ id: reserve.id, data }));
    navigation.pop();

    await editReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: {
        data,
        type: "standard",
      },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      helperStatus,
      user,
      "Reservación editada",
      `Una reservación ha sido editada por ${days} días, por el usuario ${
        user.identifier
      }, desde ${changeDate(new Date(data.start))} hasta ${changeDate(
        new Date(data.end)
      )}`,
      "accessToReservations"
    );
  };

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();

    const id = random(10, { number: true });
    const exists = standardReservations
      .filter((r) => r.ref === place.id)
      .find((re) => re.id === id);
    if (exists) return onSubmitCreate(data);
    const end = addDays(new Date(year, month, day), parseInt(data.days - 1));
    data.start = new Date(year, month, day).getTime();
    data.end = end.getTime();
    data.amount = amount;
    data.id = id;
    data.ref = place.id;
    data.type = "standard";
    data.total = data.discount ? amount - data.discount : amount;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(addRS(data));
    navigation.pop();
    await addReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: {
        data,
        type: "standard",
      },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      helperStatus,
      user,
      "Reservación creada",
      `Una reservación de ${days} días ha sido creada por ${
        user.identifier
      } desde ${changeDate(new Date(data.start))} hasta ${changeDate(
        new Date(data.end)
      )}`,
      "accessToReservations"
    );
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
            <Header
              type="Estandar"
              nomenclature={nomenclauture}
              year={year}
              month={month}
              day={day}
            />
            <View style={{ marginVertical: 30 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 220 }}
              >
                {hosted.map((item) => (
                  <Hosted
                    key={item.id}
                    item={item}
                    personStaying={personStaying}
                    removeEvent={() => {
                      const newArray = hosted.filter((h) => h.id !== item.id);
                      setHosted(newArray);
                      setValue("hosted", newArray);
                    }}
                    editingEvent={() => {
                      setEditingHosted({
                        key: Math.random(),
                        active: true,
                        ...item,
                      });
                      setModalVisiblePeople(!modalVisiblePeople);
                    }}
                  />
                ))}
              </ScrollView>
              {hosted.length < nomenclauture?.people && (
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setModalVisiblePeople(!modalVisiblePeople)}
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
              {hosted.length >= nomenclauture?.people && (
                <TextStyle
                  style={{ marginVertical: 6 }}
                  smallParagraph
                  color={light.main2}
                  center
                >
                  {`El límite de la habitación es de ${
                    nomenclauture?.people === 1
                      ? "1 huésped"
                      : `${nomenclauture.people} huéspedes`
                  }`}
                </TextStyle>
              )}
              {errors.hosted?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.hosted?.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Número de días"
                value={days}
                right={
                  days
                    ? () => <TextStyle color={light.main2}>Días</TextStyle>
                    : null
                }
                keyboardType="numeric"
                onChangeText={(num) => {
                  setDays(num.replace(/[^0-9]/g, ""));
                  setValue("days", parseInt(num) || "");
                  cleanDiscount();
                }}
                maxLength={3}
              />
              {errors.days?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.days?.type === "required"
                    ? "Digíte los dias a reservar"
                    : errors.days?.message}
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
                  setValue("discount", parseInt(value) || null);
                  setDiscount(thousandsSystem(value));
                }}
              />
            </View>
            <FinalInformation
              hosted={hosted}
              amount={amount}
              discount={discount}
              amountWithDiscount={amountWithDiscount}
              totalText="Total"
            />
            <ButtonStyle
              style={{ marginTop: 30 }}
              backgroundColor={light.main2}
              onPress={handleSubmit((data) => {
                if (loading) return;
                editing ? onSubmitEdit(data) : onSubmitCreate(data);
              })}
            >
              <TextStyle center>{editing ? "Guardar" : "Reservar"}</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AddHosted
        nomenclatureID={place.id}
        editing={editingHosted}
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        setEditing={setEditingHosted}
        settings={{ days: false }}
        hosted={hosted}
        onChange={(hosted) => {
          setHosted(hosted);
          setValue("hosted", hosted);
        }}
      />
    </Layout>
  );
};

export default CreateReserve;
