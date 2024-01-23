import { useState, useEffect } from "react";
import {
  View,
  Modal,
  Switch,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const AddPerson = ({
  modalVisible,
  setModalVisible,
  editing,
  setEditing,
  handleSubmit,
  type,
  discount,
  subtitle = 'Añade la persona que quieres alojar',
  options = {
    email: true,
    identification: true,
    phoneNumber: true,
    country: true,
    days: true,
    checkIn: true,
    discount: true,
  },
}) => {
  const {
    register,
    setValue,
    formState: { errors: hostedErrors },
    handleSubmit: handleHostedSubmit,
  } = useForm();

  const mode = useSelector((state) => state.mode);

  const [fullName, setFullName] = useState(
    editing?.active ? editing?.fullName || "" : ""
  );
  const [identification, setIdentification] = useState(
    editing?.active ? thousandsSystem(editing?.identification || "") : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    editing?.active ? editing?.phoneNumber || "" : ""
  );
  const [email, setEmail] = useState(
    editing?.active ? editing?.email || "" : ""
  );
  const [country, setCountry] = useState(
    editing?.active ? editing?.country || "" : ""
  );
  const [checkIn, setCheckIn] = useState(
    editing?.active ? !!editing?.checkIn || false : false
  );
  const [days, setDays] = useState(
    editing?.active ? String(editing?.days || "") : ""
  );
  const [discountInput, setDiscountInput] = useState(
    editing?.active ? thousandsSystem(editing?.discount || "") : ""
  );

  useEffect(() => {
    register("fullName", {
      value: editing?.active ? editing?.fullName || "" : "",
      required: true,
    });
    register("email", { value: editing?.active ? editing?.email || "" : "" });
    register("identification", {
      value: editing?.active ? editing?.identification || "" : "",
    });
    register("phoneNumber", {
      value: editing?.active ? editing?.phoneNumber || "" : "",
    });
    register("country", {
      value: editing?.active ? editing?.country || "" : "",
    });
    register("days", {
      value: editing?.active ? editing.days || null : null,
      required: type === "accommodation",
    });
    register("checkIn", {
      value: editing?.active ? editing?.checkIn || null : null,
    });
    register("discount", {
      value: editing?.active ? editing?.discount || null : null,
    });
  }, []);

  const cleanData = () => {
    setFullName("");
    setEmail("");
    setIdentification("");
    setPhoneNumber("");
    setCountry("");
    setDays("");
    setCheckIn(false);
    setDiscountInput("");
    setValue("fullName", "");
    setValue("email", "");
    setValue("identification", "");
    setValue("phoneNumber", "");
    setValue("country", "");
    setValue("days", null);
    setValue("checkIn", null);
    setValue("discount", null);
    if (editing && setEditing)
      setEditing({ key: Math.random(), active: false });
    setModalVisible(!modalVisible);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => cleanData()}
    >
      <TouchableWithoutFeedback onPress={() => cleanData()}>
        <View style={{ backgroundColor: "#0005", height: "100%" }} />
      </TouchableWithoutFeedback>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: mode === "light" ? light.main4 : dark.main1,
            },
          ]}
        >
          <View>
            <View style={styles.row}>
              <TextStyle color={light.main2} bigSubtitle>
                AGREGAR
              </TextStyle>
              <TouchableOpacity onPress={() => cleanData()}>
                <Ionicons
                  name="close"
                  size={getFontSize(28)}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
              </TouchableOpacity>
            </View>
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {subtitle}
            </TextStyle>
          </View>
          <View>
            <ScrollView>
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
                  setFullName(text);
                  setValue("fullName", text);
                }}
              />
              {hostedErrors.fullName?.type && (
                <TextStyle verySmall color={light.main2}>
                  El nombre completo obligatorio
                </TextStyle>
              )}
              {options.email && (
                <InputStyle
                  value={email}
                  placeholder="Correo electrónico"
                  right={
                    email
                      ? () => <TextStyle color={light.main2}>Correo</TextStyle>
                      : null
                  }
                  maxLength={40}
                  keyboardType="email-address"
                  onChangeText={(text) => {
                    setEmail(text);
                    setValue("email", text);
                  }}
                />
              )}
              {options.identification && (
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
                    setIdentification(
                      thousandsSystem(text.replace(/[^0-9]/g, ""))
                    );
                    setValue("identification", text.replace(/[^0-9]/g, ""));
                  }}
                />
              )}
              {options.phoneNumber && (
                <InputStyle
                  value={phoneNumber}
                  placeholder="Número de teléfono"
                  right={
                    phoneNumber
                      ? () => (
                          <TextStyle color={light.main2}>Teléfono</TextStyle>
                        )
                      : null
                  }
                  keyboardType="numeric"
                  maxLength={15}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    setValue("phoneNumber", text);
                  }}
                />
              )}
              {options.country && (
                <InputStyle
                  value={country}
                  placeholder="País"
                  right={
                    country
                      ? () => <TextStyle color={light.main2}>País</TextStyle>
                      : null
                  }
                  maxLength={30}
                  onChangeText={(text) => {
                    setCountry(text);
                    setValue("country", text);
                  }}
                />
              )}
              {type === "accommodation" && (
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
                    setValue("days", parseInt(num) || null);
                  }}
                  maxLength={3}
                />
              )}
              {hostedErrors.days?.type && (
                <TextStyle verySmall color={light.main2}>
                  {hostedErrors.days.type === "required"
                    ? "Digíte los dias a reservar"
                    : hostedErrors.days.message}
                </TextStyle>
              )}
              {discount && (
                <InputStyle
                  placeholder="Descuento"
                  value={discountInput}
                  right={
                    discountInput
                      ? () => (
                          <TextStyle color={light.main2}>Descuento</TextStyle>
                        )
                      : null
                  }
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    const value = num.replace(/[^0-9]/g, "");

                    if (value > editing?.amount) return;
                    setDiscountInput(thousandsSystem(value));
                    setValue("discount", parseInt(value) || null);
                  }}
                />
              )}
              {options.checkIn && (
                <View style={[styles.row, { marginTop: 10 }]}>
                  <TextStyle smallParagraph color={light.main2}>
                    CHECK IN ¿YA LLEGO EL HUÉSPED?
                  </TextStyle>
                  <Switch
                    trackColor={{ false: dark.main2, true: light.main2 }}
                    thumbColor={light.main4}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => {
                      setCheckIn(!checkIn);
                      setValue(
                        "checkIn",
                        !checkIn ? new Date().getTime() : null
                      );
                    }}
                    value={checkIn}
                  />
                </View>
              )}
            </ScrollView>
          </View>
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={handleHostedSubmit((data) =>
              handleSubmit({ data, cleanData })
            )}
          >
            <TextStyle center>Guardar</TextStyle>
          </ButtonStyle>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
});

export default AddPerson;
