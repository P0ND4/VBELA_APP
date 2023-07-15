import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Image,
  View,
  Modal,
  Dimensions,
  TouchableNativeFeedback,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Vibration,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Logo from "@assets/logo.png";
import axios from "axios";
import IMGMastercard from "@assets/icons/mastercard.png";
import IMGVisa from "@assets/icons/visa.png";
import md5 from "md5";
import { useForm } from "react-hook-form";
import { thousandsSystem } from "@helpers/libs";
import TextStyle from "./TextStyle";
import InputStyle from "./InputStyle";
import theme from "@theme";
import countries from "@countries.json";

const light = theme.colors.light;
const dark = theme.colors.dark;

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export default function App({
  subtitle = "Plan basico",
  amount = 0,
  email = "melvincolmenares.m@gmail.com",
  success,
  failed,
  activePayment = true,
  setActivePayment,
}) {
  const payuConfig = {
    apiLogin: "9T3KQn0fJe9ZO8r",
    apiKey: "wF7AZeB17R9KUT1Pmg2j4TCpae",
    accountId: "933983",
    merchantId: "926706",
    test: true,
    userAgent: "PAYU",
    cookie: "xdxdxd",
    deviceSessionId: "123123123",
    paymentCountry: "CO",
    description: "Pago del plan basico xd",
    currency: "USD",
    referenceCode: "123123123",
  };

  const {
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = useForm();

  const mode = useSelector((state) => state.mode);

  useEffect(() => {
    register("card", {
      value: "",
      required: true,
      validate: (num) => num.length >= 14 || "Tarjeta incompleta.",
    });
    register("identification", { value: "", required: true });
    register("mmaa", {
      value: "",
      required: true,
      validate: (num) => {
        if (num.length !== 4) return "MMAA incompleto.";

        const mm = num.slice(0, 2);
        const yy = num.slice(2, 4);

        if (parseInt(yy) < 23) return "La tarjeta expiró";
        if (parseInt(mm) > 12 || parseInt(mm) === 0) return "Mes invalido.";
        if (parseInt(yy) > 40) return "Año invalido.";
      },
    });
    register("cvc", {
      value: "",
      required: true,
      validate: (num) => num.length === 3 || "CVC incompleto",
    });
    register("fullName", { value: "", required: true });
    register("country", { value: "", required: true });
    register("city", { value: "", required: true });
    register("phoneNumber", {
      value: "",
      required: true,
      validate: (num) => num.length >= 10 || "Número de teléfono inválido",
    });
    register("postalCode", {
      value: "",
      required: true,
      validate: (num) => num.length >= 3 || "Postal invalido.",
    });
    register("state", { value: "", required: true });
  }, []);

  const [cards, setCards] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@cards");
        if (JSON.parse(jsonValue)) setCards(JSON.parse(jsonValue));
        else setCards([]);
      } catch (e) {
        console.log(e);
      }
    };

    getData();
  }, []);

  const [loading, setLoading] = useState(false);
  const [activeAdd, setActiveAdd] = useState(false);
  const [type, setType] = useState("");

  const [card, setCard] = useState("");
  const [identification, setIdentification] = useState("");
  const [mmaa, setMmaa] = useState("");
  const [cvc, setCvc] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [error, setError] = useState("");
  const [cardType, setCardType] = useState("");
  const [errorValidation, setErrorValidation] = useState(false);

  const secondPart = useRef(new Animated.Value(0)).current;
  const thirdPart = useRef(new Animated.Value(0)).current;

  const viewRef = useRef(new Animated.Value(height / 2.8)).current;
  const addRef = useRef(new Animated.Value(height / 1.1)).current;
  const errorRef = useRef(new Animated.Value(height / 2.8)).current;

  const countriesRef = useRef();
  const shake = useRef(new Animated.Value(0)).current;
  const cardNumer = useRef();
  const identificationRef = useRef();
  const MMAA = useRef();
  const CVC = useRef();
  const fullname = useRef();

  const cleanData = () => {
    setCard("");
    setCardType("");
    setIdentification("");
    setMmaa("");
    setCvc("");
    setFullName("");
    setCountry("");
    setCity("");
    setPostalCode("");
    setState("");
    setValue("");
    setPhoneNumber("");
    setValue("card", "");
    setValue("identification", "");
    setValue("mmaa", "");
    setValue("cvc", "");
    setValue("fullName", "");
    setValue("country", "");
    setValue("city", "");
    setValue("postalCode", "");
    setValue("state", "");
    setValue("phoneNumber", "");
  };

  const add = async (data) => {
    Keyboard.dismiss();
    const hash = md5(data.card);

    let cardsCurrent = [];

    const jsons = await AsyncStorage.getItem("@cards");
    const jsonPARSE = JSON.parse(jsons);
    if (jsonPARSE) {
      cardsCurrent = jsonPARSE;
      const card = jsonPARSE.find((card) => card.hash === hash);
      if (card) return Alert.alert("", "La tarjeta ya existe");
    }

    setLoading(true);

    const result = await axios({
      method: "POST",
      url: "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        language: "es",
        command: "CREATE_TOKEN",
        merchant: {
          apiKey: payuConfig.apiKey,
          apiLogin: payuConfig.apiLogin,
        },
        creditCardToken: {
          payerId: hash,
          name: data.fullName,
          identificationNumber: data.identification,
          paymentMethod: cardType,
          number: data.card,
          expirationDate: `20${data.mmaa.slice(2, 4)}/${data.mmaa.slice(0, 2)}`,
        },
      },
    });

    if (result.data.code === "ERROR") {
      setLoading(false);
      return setErrorValidation(true);
    }

    const value = {
      hash,
      token: result.data.creditCardToken.creditCardTokenId,
      identification: result.data.creditCardToken.identificationNumber,
      name: result.data.creditCardToken.name,
      payerId: result.data.creditCardToken.payerId,
      paymentMethod: result.data.creditCardToken.paymentMethod,
      maskedNumber: result.data.creditCardToken.maskedNumber,
      mmaa: `20${data.mmaa.slice(2, 4)}/${data.mmaa.slice(0, 2)}`,
      cvc: data.cvc,
      country: data.country,
      city: data.city,
      postalCode: data.postalCode,
      state: data.state,
      phoneNumber: data.phoneNumber,
    };

    try {
      cardsCurrent.push(value);
      const jsonValue = JSON.stringify(cardsCurrent);
      await AsyncStorage.setItem("@cards", jsonValue);
    } catch (e) {
      console.log(e);
    }

    cleanData();
    setActiveAdd(false);
    setCards(cardsCurrent);
    setLoading(false);
  };

  const config = {
    duration: 300,
    useNativeDriver: true,
  };

  useEffect(() => {
    const word = card.replace(/[^0-9]/g, "");
    const type = getCardType(word);

    if (
      identification.length >= 8 &&
      cvc.length === 3 &&
      mmaa.length === 5 &&
      type &&
      word.length === 16
    ) {
      Animated.timing(thirdPart, {
        toValue: 1,
        useNativeDriver: true,
        duration: 200,
      }).start();
    } else {
      Animated.timing(thirdPart, {
        toValue: 0,
        useNativeDriver: true,
        duration: 200,
      }).start();
    }
  }, [identification, cvc, mmaa, card]);

  useEffect(() => {
    const word = card.replace(/[^0-9]/g, "");
    const type = getCardType(word);

    const config = {
      duration: 100,
      useNativeDriver: true,
    };

    if (!type && word.length === 16) {
      Animated.timing(shake, { toValue: 4, ...config }).start(() =>
        Animated.timing(shake, { toValue: -4, ...config }).start(() =>
          Animated.timing(shake, { toValue: 0, ...config }).start()
        )
      );
    } else if (type && word.length === 16) {
      Animated.timing(secondPart, {
        toValue: 1,
        ...config,
        duration: 200,
      }).start();
    } else {
      Animated.timing(secondPart, {
        toValue: 0,
        ...config,
        duration: 200,
      }).start();
    }
  }, [card]);

  useEffect(() => {
    if (activePayment && !activeAdd && !errorValidation) {
      Animated.timing(viewRef, { toValue: 0, ...config }).start();
    } else {
      Animated.timing(viewRef, { toValue: height / 2.8, ...config }).start();
    }

    if (activeAdd && !errorValidation) {
      Animated.timing(addRef, { toValue: 0, ...config }).start();
    } else {
      Animated.timing(addRef, { toValue: height / 1.1, ...config }).start();
    }

    if (errorValidation) {
      Animated.timing(errorRef, { toValue: 0, ...config }).start();
    } else {
      Animated.timing(errorRef, { toValue: height / 2.8, ...config }).start();
    }
  }, [viewRef, addRef, activeAdd, errorValidation, errorRef]);

  const getCardType = (cardNo) => {
    const cards = {
      MASTERCARD: /^5[1-5][0-9]{14}$/,
      VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
    };

    for (var card in cards) {
      if (cards[card].test(cardNo)) {
        return card;
      }
    }

    return undefined;
  };

  const addLetter = (string, word, steps) => {
    let newString = "";
    const lengthString = string.length;
    for (let i = 0; i < lengthString; i += steps) {
      if (i + steps < lengthString) {
        newString += string.substring(i, i + steps) + word;
      } else {
        newString += string.substring(i, lengthString);
      }
    }
    return newString;
  };

  const removeCard = async (hash) => {
    const jsons = await AsyncStorage.getItem("@cards");
    const jsonPARSE = JSON.parse(jsons);
    const remove = jsonPARSE.filter((card) => card.hash !== hash);

    if (remove.length === 0) await AsyncStorage.removeItem("@cards");
    else await AsyncStorage.setItem("@cards", JSON.stringify(remove));

    setCards(remove);
  };

  const proceedPayment = async (card) => {
    const signature = md5(
      `${payuConfig.apiKey}~${payuConfig.merchantId}~${payuConfig.referenceCode}~${amount}~${payuConfig.currency}`
    );

    const result = await axios({
      method: "POST",
      url: "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        language: "es",
        command: "SUBMIT_TRANSACTION",
        merchant: {
          apiKey: payuConfig.apiKey,
          apiLogin: payuConfig.apiLogin,
        },
        transaction: {
          order: {
            accountId: payuConfig.accountId,
            referenceCode: payuConfig.referenceCode,
            description: payuConfig.description,
            language: payuConfig.language,
            signature,
            notifyUrl: payuConfig.notifyUrl,
            additionalValues: {
              TX_VALUE: {
                value: amount,
                currency: "USD",
              },
              TX_TAX: {
                value: 0,
                currency: "USD",
              },
              TX_TAX_RETURN_BASE: {
                value: 0,
                currency: "USD",
              },
            },
            buyer: {
              merchantBuyerId: payuConfig.merchantPayerId,
              fullName: card.name,
              emailAddress: email,
              contactPhone: card.phoneNumber,
              dniNumber: card.identification,
              shippingAddress: {
                street1: card.postalCode,
                city: card.city,
                state: card.state,
                country: card.country,
                postalCode: card.postalCode,
                phone: card.phoneNumber,
              },
            },
          },
          payer: {
            merchantPayerId: payuConfig.merchantPayerId,
            fullName: card.name,
            emailAddress: email,
            contactPhone: card.phoneNumber,
            dniNumber: card.identification,
            billingAddress: {
              street1: card.postalCode,
              city: card.city,
              state: card.state,
              country: card.country,
              postalCode: card.postalCode,
            },
          },
          creditCardTokenId: card.token,
          creditCard: {
            securityCode: card.cvc,
          },
          type: "AUTHORIZATION_AND_CAPTURE",
          paymentMethod: card.paymentMethod,
          paymentCountry: payuConfig.paymentCountry,
          deviceSessionId: payuConfig.deviceSessionId,
          ipAddress: payuConfig.ipAddress,
          cookie: payuConfig.cookie,
          userAgent: payuConfig.userAgent,
        },
        test: payuConfig.test,
      },
    });

    if (result.data.code === "ERROR") {
      if (failed) failed(result.data.error);
      return console.error(result.data.error);
    }

    if (result.data.code === "SUCCESS") {
      if (result.data.state === "DECLINED") {
        if (failed) failed(result.data.paymentNetworkResponseErrorMessage);
        return console.error(result.data.paymentNetworkResponseErrorMessage);
      }

      if (result.data.state === "APPROVE") {
        if (success) success(result.data);
        if (setActivePayment) setActivePayment(false);
        return;
      }
    }
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={activePayment}
        onRequestClose={() => setActivePayment(false)}
      >
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.add,
              {
                transform: [{ translateY: addRef }],
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              },
            ]}
          >
            <KeyboardAvoidingView
              style={{ flex: 1, padding: 20 }}
              keyboardVerticalOffset={80}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setActiveAdd(false);
                    cleanData();
                  }}
                >
                  <Ionicons
                    name="arrow-back"
                    size={40}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                    style={{ marginRight: 15 }}
                  />
                </TouchableOpacity>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Añadir tarjeta de crédito o débito
                </TextStyle>
              </View>
              <ScrollView>
                <Animated.View
                  style={[
                    styles.information,
                    {
                      transform: [
                        {
                          translateX: shake,
                        },
                      ],
                    },
                  ]}
                >
                  <InputStyle
                    stylesContainer={{
                      borderColor:
                        type === "card" ? light.main2 : "transparent",
                      borderWidth: 1,
                    }}
                    innerRef={cardNumer}
                    value={card}
                    left={() => (
                      <View>
                        {cardType === "MASTERCARD" && (
                          <Image
                            style={{ width: 40, height: 20, marginRight: 15 }}
                            source={IMGMastercard}
                          />
                        )}
                        {cardType === "VISA" && (
                          <Image
                            style={{ width: 40, height: 20, marginRight: 15 }}
                            source={IMGVisa}
                          />
                        )}
                        {!cardType && (
                          <Ionicons
                            name="card-outline"
                            size={25}
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                            style={{ marginRight: 15 }}
                          />
                        )}
                      </View>
                    )}
                    maxLength={19}
                    onChangeText={(text) => {
                      const word = text.replace(/[^0-9]/g, "");
                      setValue("card", word);
                      const type = getCardType(word);

                      setCard(addLetter(word, " ", 4));

                      if (type) setCardType(type);
                      else setCardType("");

                      if (!type && word.length === 16) Vibration.vibrate();

                      if (word.length === 16 && !type) setError(true);
                      else setError(false);

                      if (word.length === 16 && type)
                        identificationRef.current?.focus();
                    }}
                    onFocus={() => setType("card")}
                    onBlur={() => setType("")}
                    placeholder="Número de tarjeta"
                    keyboardType="numeric"
                  />
                  {error && (
                    <TextStyle
                      color={light.main2}
                      customStyle={{ marginTop: 8 }}
                      verySmall
                    >
                      Metodo de pago no válido o no admitido.
                    </TextStyle>
                  )}
                  {errors.card?.type && (
                    <TextStyle
                      color={light.main2}
                      customStyle={{ marginTop: 8 }}
                      verySmall
                    >
                      {errors.card?.type === "required"
                        ? "Campo requerido."
                        : errors.card?.message}
                    </TextStyle>
                  )}
                  <Animated.View style={{ opacity: secondPart }}>
                    <InputStyle
                      stylesContainer={{
                        borderColor:
                          type === "identification"
                            ? light.main2
                            : "transparent",
                        borderWidth: 1,
                      }}
                      innerRef={identificationRef}
                      value={identification}
                      maxLength={15}
                      onChangeText={(text) => {
                        setValue("identification", text.replace(/[^0-9]/g, ""));
                        setIdentification(
                          thousandsSystem(text.replace(/[^0-9]/g, ""))
                        );
                      }}
                      onFocus={() => setType("identification")}
                      onBlur={() => setType("")}
                      placeholder="Número de identificación"
                      keyboardType="numeric"
                    />
                    {errors.identification?.type && (
                      <TextStyle
                        verySmall
                        color={light.main2}
                        customStyle={{ marginTop: 8 }}
                      >
                        Campo requerido.
                      </TextStyle>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <InputStyle
                          innerRef={MMAA}
                          stylesContainer={{
                            borderColor:
                              type === "MMAA" ? light.main2 : "transparent",
                            borderWidth: 1,
                          }}
                          value={mmaa}
                          maxLength={5}
                          onChangeText={(text) => {
                            const word = text.replace(/[^0-9]/g, "");
                            setValue("mmaa", word);
                            setMmaa(addLetter(word, "/", 2));
                          }}
                          onFocus={() => setType("MMAA")}
                          onBlur={() => setType("")}
                          placeholder="MMAA"
                          keyboardType="numeric"
                          stylesInput={{ width: width / 2.5 }}
                        />
                        {errors.mmaa?.type && (
                          <TextStyle
                            verySmall
                            color={light.main2}
                            customStyle={{ marginTop: 8 }}
                          >
                            {errors.mmaa?.type === "required"
                              ? "Campo requerido."
                              : errors.mmaa?.message}
                          </TextStyle>
                        )}
                      </View>
                      <View>
                        <InputStyle
                          innerRef={CVC}
                          stylesContainer={{
                            borderColor:
                              type === "CVC" ? light.main2 : "transparent",
                            borderWidth: 1,
                          }}
                          value={cvc}
                          maxLength={3}
                          onChangeText={(text) => {
                            const word = text.replace(/[^0-9]/g, "");
                            setValue("cvc", word);
                            setCvc(word);
                          }}
                          onFocus={() => setType("CVC")}
                          onBlur={() => setType("")}
                          placeholder="CVC"
                          keyboardType="numeric"
                          stylesInput={{ width: width / 2.5 }}
                        />
                        {errors.cvc?.type && (
                          <TextStyle
                            verySmall
                            color={light.main2}
                            customStyle={{ marginTop: 8 }}
                          >
                            {errors.cvc?.type === "required"
                              ? "Campo requerido."
                              : errors.cvc?.message}
                          </TextStyle>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                  <Animated.View style={{ opacity: thirdPart }}>
                    <InputStyle
                      stylesContainer={{
                        borderColor:
                          type === "fullname" ? light.main2 : "transparent",
                        borderWidth: 1,
                      }}
                      innerRef={fullname}
                      maxLength={35}
                      value={fullName}
                      onChangeText={(text) => {
                        setValue("fullName", text);
                        setFullName(text);
                      }}
                      onFocus={() => setType("fullname")}
                      onBlur={() => setType("")}
                      placeholder="Nombre completo"
                    />
                    {errors.fullName?.type && (
                      <TextStyle
                        verySmall
                        color={light.main2}
                        customStyle={{ marginTop: 8 }}
                      >
                        Campo requerido.
                      </TextStyle>
                    )}
                    <TouchableOpacity
                      onPress={() => countriesRef.current.focus()}
                      style={[
                        styles.input,
                        {
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                          borderColor: "transparent",
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        customStyle={{ paddingVertical: 4 }}
                        color={
                          country
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#AAAAAA"
                        }
                      >
                        {country ? country : "País"}
                      </TextStyle>
                      <Picker
                        ref={countriesRef}
                        style={{ display: "none" }}
                        selectedValue={country}
                        onValueChange={async (value) => {
                          setValue("country", value.split("-")[1]);
                          setCountry(value.split("-")[0]);
                        }}
                      >
                        <Picker.Item label="Seleccione su país" value="" />
                        {countries.map((item) => (
                          <Picker.Item
                            key={item.country_phone_code}
                            label={item.country_name}
                            value={`${item.country_name}-${item.country_short_name}`}
                          />
                        ))}
                      </Picker>
                    </TouchableOpacity>
                    {errors.country?.type && (
                      <TextStyle
                        verySmall
                        customStyle={{ marginTop: 8 }}
                        color={light.main2}
                      >
                        Campo requerido.
                      </TextStyle>
                    )}
                    <InputStyle
                      maxLength={16}
                      stylesContainer={{
                        borderColor:
                          type === "phoneNumber" ? light.main2 : "transparent",
                        borderWidth: 1,
                      }}
                      value={phoneNumber}
                      onChangeText={(text) => {
                        const word = text.replace(/[^0-9]/g, "");
                        setValue("phoneNumber", word);
                        setPhoneNumber(word);
                      }}
                      onFocus={() => setType("phoneNumber")}
                      onBlur={() => setType("")}
                      placeholder="Número de teléfono"
                      keyboardType="numeric"
                    />
                    {errors.phoneNumber?.type && (
                      <TextStyle
                        verySmall
                        customStyle={{ marginTop: 8 }}
                        color={light.main2}
                      >
                        {errors.phoneNumber?.type === "required"
                          ? "Campo requerido."
                          : errors.phoneNumber?.message}
                      </TextStyle>
                    )}
                    <InputStyle
                      maxLength={20}
                      value={city}
                      stylesContainer={{
                        borderColor:
                          type === "city" ? light.main2 : "transparent",
                        borderWidth: 1,
                      }}
                      onChangeText={(text) => {
                        setValue("city", text);
                        setCity(text);
                      }}
                      onFocus={() => setType("city")}
                      onBlur={() => setType("")}
                      placeholder="Ciudad"
                    />
                    {errors.city?.type && (
                      <TextStyle
                        verySmall
                        customStyle={{ marginTop: 8 }}
                        color={light.main2}
                      >
                        Campo requerido.
                      </TextStyle>
                    )}
                    <InputStyle
                      maxLength={6}
                      value={postalCode}
                      stylesContainer={{
                        borderColor:
                          type === "postalCode" ? light.main2 : "transparent",
                        borderWidth: 1,
                      }}
                      onChangeText={(text) => {
                        const word = text.replace(/[^0-9]/g, "");
                        setValue("postalCode", word);
                        setPostalCode(word);
                      }}
                      onFocus={() => setType("postalCode")}
                      onBlur={() => setType("")}
                      placeholder="Código postal"
                      keyboardType="numeric"
                    />
                    {errors.postalCode?.type && (
                      <TextStyle
                        verySmall
                        customStyle={{ marginTop: 8 }}
                        color={light.main2}
                      >
                        {errors.postalCode?.type === "required"
                          ? "Campo requerido."
                          : errors.postalCode?.message}
                      </TextStyle>
                    )}
                    <InputStyle
                      maxLength={20}
                      value={state}
                      stylesContainer={{
                        borderColor:
                          type === "state" ? light.main2 : "transparent",
                        borderWidth: 1,
                      }}
                      onChangeText={(text) => {
                        setValue("state", text);
                        setState(text);
                      }}
                      onFocus={() => setType("state")}
                      onBlur={() => setType("")}
                      placeholder="Estado"
                    />
                    {errors.state?.type && (
                      <TextStyle
                        verySmall
                        customStyle={{ marginTop: 8 }}
                        color={light.main2}
                      >
                        Campo requerido.
                      </TextStyle>
                    )}
                  </Animated.View>
                </Animated.View>
              </ScrollView>
            </KeyboardAvoidingView>
            <View
              style={[
                styles.shortInformation,
                {
                  borderTopColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={Logo}
                    style={{ width: 50, height: 50, borderRadius: 6 }}
                  />
                  <TextStyle
                    color={light.main2}
                    customStyle={{ marginLeft: 15 }}
                  >
                    {subtitle}
                  </TextStyle>
                </View>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {amount} USD
                </TextStyle>
              </View>
              <TouchableNativeFeedback
                onPress={handleSubmit((data) => add(data))}
              >
                <View style={[styles.save, { backgroundColor: light.main2 }]}>
                  <TextStyle smallParagraph color={light.textDark}>
                    Guardar
                  </TextStyle>
                </View>
              </TouchableNativeFeedback>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.view,
              {
                transform: [{ translateY: errorRef }],
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              },
            ]}
          >
            <View
              style={{
                padding: 15,
                borderBottomColor:
                  mode === "light" ? light.textDark : dark.textWhite,
                borderBottomWidth: 1,
              }}
            >
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                customStyle={{ marginBottom: 15 }}
              >
                ERROR
              </TextStyle>
              <TextStyle
                verySmall
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                No se ha podido realizar la solicitud. Usa otro método de pago o
                ponte en contacto con nosotros.
              </TextStyle>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={Logo}
                  style={{ width: 70, height: 70, borderRadius: 12 }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "77%",
                    marginBottom: 5,
                    marginLeft: 20,
                  }}
                >
                  <TextStyle color={light.main2}>{subtitle}</TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {amount} USD
                  </TextStyle>
                </View>
              </View>
              <TouchableNativeFeedback
                onPress={() => setErrorValidation(false)}
              >
                <View
                  style={[
                    styles.addCard,
                    {
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      justifyContent: "center",
                      marginTop: 20,
                      backgroundColor: light.main2,
                    },
                  ]}
                >
                  <TextStyle smallParagraph color={light.textDark}>
                    Aceptar
                  </TextStyle>
                </View>
              </TouchableNativeFeedback>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.view,
              {
                transform: [{ translateY: viewRef }],
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              },
            ]}
          >
            {cards === null ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <ActivityIndicator size={50} color={light.main2} />
                <TextStyle smallParagraph customStyle={{ marginTop: 10 }}>
                  Cargando
                </TextStyle>
              </View>
            ) : (
              <>
                <View
                  style={{
                    padding: 15,
                    borderBottomColor:
                      mode === "light" ? light.textDark : dark.textWhite,
                    borderBottomWidth: 1,
                  }}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    VBELA PAY
                  </TextStyle>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={Logo}
                      style={{ width: 70, height: 70, borderRadius: 12 }}
                    />
                    <View style={{ marginLeft: 20, width: "75%" }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <TextStyle color={light.main2}>{subtitle}</TextStyle>
                        <TextStyle
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          {amount} USD
                        </TextStyle>
                      </View>
                      <TextStyle
                        verySmall
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {email}
                      </TextStyle>
                    </View>
                  </View>
                  {cards.length === 0 && (
                    <TextStyle
                      verySmall
                      color={mode === "light" ? light.textDark : dark.textWhite}
                      customStyle={{ marginVertical: 18 }}
                    >
                      Añade un método de pago para completar la compra. Solo
                      VBELA puede ver tus datos de pago.
                    </TextStyle>
                  )}
                  <ScrollView
                    style={{ maxHeight: height / 6.5, marginTop: 10 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {cards.map((card) => (
                      <TouchableNativeFeedback
                        key={card.token}
                        onPress={() =>
                          Alert.alert(
                            "¿Quieres pagar con esta tarjeta?",
                            "Una vez se efectue el pago no podrás cancelarlo",
                            [
                              {
                                text: "Cancelar",
                                style: "cancel",
                              },
                              {
                                text: "Estoy seguro",
                                onPress: () => proceedPayment(card),
                              },
                            ]
                          )
                        }
                        onLongPress={() =>
                          Alert.alert(
                            "¿Quieres eliminar la tarjeta?",
                            "Una vez eliminada no podrás usar esta tarjeta para hacer pagos",
                            [
                              {
                                text: "Cancelar",
                                style: "cancel",
                              },
                              {
                                text: "Estoy seguro",
                                onPress: () => removeCard(card.hash),
                              },
                            ]
                          )
                        }
                      >
                        <View
                          style={[
                            styles.addCard,
                            {
                              paddingVertical: 7,
                              marginTop: 8,
                            },
                          ]}
                        >
                          <Image
                            style={{ width: 60, height: 40, marginRight: 15 }}
                            source={
                              card.paymentMethod === "MASTERCARD"
                                ? IMGMastercard
                                : IMGVisa
                            }
                          />
                          <View>
                            <TextStyle
                              verySmall
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {card.maskedNumber}
                            </TextStyle>
                            <TextStyle
                              verySmall
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {card.name}
                            </TextStyle>
                          </View>
                        </View>
                      </TouchableNativeFeedback>
                    ))}
                    <TouchableNativeFeedback
                      onPress={() => {
                        setActiveAdd(true);
                        cardNumer.current.focus();
                      }}
                    >
                      <View
                        style={[
                          styles.addCard,
                          {
                            marginTop: 8,
                            backgroundColor: light.main2,
                          },
                        ]}
                      >
                        <Ionicons
                          name="card-outline"
                          size={40}
                          color={light.textDark}
                          style={{ marginRight: 10 }}
                        />
                        <TextStyle verySmall color={light.textDark}>
                          Añadir una tarjeta de crédito o débito
                        </TextStyle>
                      </View>
                    </TouchableNativeFeedback>
                  </ScrollView>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
      {loading && (
        <Modal animationType="fade" transparent={true} visible={loading}>
          <View
            style={[
              styles.container,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              },
            ]}
          >
            <ActivityIndicator size={50} color={light.main2} />
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
              customStyle={{ marginTop: 18 }}
            >
              Añadiendo tarjeta
            </TextStyle>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.4)",
  },
  view: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height / 2.8,
  },
  addCard: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  add: {
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  shortInformation: {
    padding: 20,
    width: "100%",
    borderTopWidth: 1,
    alignItems: "center",
  },
  information: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  save: {
    width: "80%",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
});
