import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addReservation } from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { add as addRA } from "@features/zones/accommodationReservationsSlice";
import Header from "@utils/reservation/create/Header";
import FinalInformation from "@utils/reservation/create/FinalInformation";
import helperNotification from "@helpers/helperNotification";
import { Hosted, AddHosted } from "@utils/reservation/create/HostedEvent";
import { addDays, changeDate, random, thousandsSystem, getFontSize } from "@helpers/libs";
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
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const helperStatus = useSelector((state) => state.helperStatus);
  const nomenclatures = useSelector((state) => state.nomenclatures);

  const personStaying = route.params?.hosted;
  const place = route.params?.place;
  const { day, month, year } = route.params?.date;

  const [loading, setLoading] = useState(false);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);

  const [hosted, setHosted] = useState(personStaying || []);

  const [editingHosted, setEditingHosted] = useState({
    key: Math.random(),
    active: false,
  });

  const [amount, setAmount] = useState("");
  const [amountWithDiscount, setAmountWithDiscount] = useState("");
  const [discount, setDiscount] = useState("");

  const [nomenclature, setNomenclature] = useState(null);

  const dispatch = useDispatch();

  useEffect(
    () => setNomenclature(nomenclatures.find((n) => n.id === place.id)),
    [place, nomenclatures]
  );

  useEffect(() => {
    (() => {
      const accommodationSelected = nomenclature?.accommodation;
      const amount =
        accommodationSelected?.reduce(
          (a, b) => a + b.accommodation.reduce((a, b) => a + b.value, 0),
          0
        ) || 0;

      setAmount(amount);
      if (discount) setAmountWithDiscount(amount - discount.replace(/[^0-9]/g, ""));
    })();
  }, [hosted.length, discount, nomenclature]);

  useEffect(() => {
    register("hosted", {
      value: personStaying || [],
      validate: {
        min: (value) => value.length > 0 || "Tiene que haber mínimo 1 huésped",
      },
    });
    register("payment", { value: [] });
    register("discount", { value: null });
  }, []);

  const onSubmitCreate = async (data) => {
    setLoading(true);
    Keyboard.dismiss();
    const id = random(10, { number: true });

    const exists = accommodationReservations
      .filter((r) => r.ref === place.id)
      .find((re) => re.id === id);
    if (exists) return onSubmitCreate(data);

    const reservations = hosted.map((h) => {
      const total = (data.discount ? amount - data.discount : amount) * h.days;
      const obj = { ...h };
      const end = addDays(new Date(year, month, day), parseInt(h.days - 1));
      obj.end = end.getTime();
      obj.start = new Date(year, month, day).getTime();
      obj.amount = amount;
      obj.type = "accommodation";
      obj.total = total;
      obj.discount = data.discount;
      obj.accommodation = nomenclature?.accommodation;
      obj.payment = [];
      obj.status = null;
      obj.creationDate = new Date().getTime();
      obj.modificationDate = new Date().getTime();
      return obj;
    });

    dispatch(addRA(reservations));
    navigation.pop();
    await addReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reservations,
        type: "accommodation",
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
    await helperNotification(
      helperStatus,
      user,
      "Reservación creada",
      `Una reservación ha sido creada por ${user.identifier} desde ${changeDate(
        new Date(data.start)
      )} hasta ${changeDate(new Date(data.end))}`,
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
              type="Acomodación"
              nomenclature={nomenclature}
              year={year}
              month={month}
              day={day}
            />
            <View style={{ marginVertical: 30 }}>
              <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
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
              {errors.hosted?.type && (
                <TextStyle verySmall color={light.main2}>
                  {errors.hosted?.message}
                </TextStyle>
              )}
              <InputStyle
                placeholder="Descuento (En valor)"
                value={discount}
                right={
                  discount ? () => <TextStyle color={light.main2}>Descuento</TextStyle> : null
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
              discount={discount}
              hosted={hosted}
              amount={amount}
              amountWithDiscount={amountWithDiscount}
              totalText="Total por día"
            />
            <ButtonStyle
              style={{ marginTop: 30 }}
              backgroundColor={light.main2}
              onPress={handleSubmit((data) => {
                if (loading) return;
                onSubmitCreate(data);
              })}
            >
              <TextStyle center>Guardar</TextStyle>
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
