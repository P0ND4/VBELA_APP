import { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import VerificationImage from "@assets/login/verification.png";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import { checkPhoneNumberVerification } from "../../api";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Verification = ({ navigation, route }) => {
  const mode = useSelector((state) => state.mode);

  const [inputContainerIsFocused, setInputContainerIsFocused] = useState(false);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState(null);

  //TODO TERMINAR ESTA PARTE
  //TODO Que el codigo tenga de expedicion 15 minutos si ya se le ha enviado un codigo de verificacion que lo utilice
  //TODO Agregar llamada si se registro con numero de telefono

  const textInputRef = useRef(null);

  const maxLength = 6;
  const codeDigitsArray = new Array(maxLength).fill(0);
  const { type, value } = route.params;

  useEffect(() => {
    if (maxLength === code.length) Keyboard.dismiss();
  }, [code]);

  const handleBlur = () => {
    setInputContainerIsFocused(false); // Cuando el input no esta activo
  };

  const handleOnPress = () => {
    // Cuando el input esta activo
    setInputContainerIsFocused(true);
    textInputRef?.current?.focus();
  };

  const toCodeDigitInput = (_value, index) => {
    // Digitar numeros en pantalla
    const emptyInputChar = " ";
    const digit = code[index] || emptyInputChar;

    return (
      <TouchableWithoutFeedback onPress={handleOnPress} key={index}>
        <View
          style={[
            styles.verificationCode,
            {
              backgroundColor:
                inputContainerIsFocused && index === code.length
                  ? light.main2
                  : mode === "light"
                  ? light.main5
                  : dark.main2,
            },
          ]}
        >
          <TextStyle
            color={
              inputContainerIsFocused && index === code.length
                ? light.textDark
                : mode === "light"
                ? light.textDark
                : dark.textWhite
            }
          >
            {digit}
          </TextStyle>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexGrow: 0.7,
            }}
          >
            <Image
              source={VerificationImage}
              style={{ width: 250, height: 250 }}
            />
            <View>
              <TextStyle center color={light.main2} subtitle>
                ¡ENVIADO!
              </TextStyle>
              <TextStyle
                smallParagraph
                center
                customStyle={{ marginTop: 8 }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Hemos enviado un código de verificación a tu{" "}
                {type === "email" ? "correo electrónico" : "número de teléfono"}{" "}
                {value}
              </TextStyle>
            </View>
            <View style={styles.verificationCodeContainer}>
              {codeDigitsArray.map(toCodeDigitInput)}
            </View>
            <TextInput
              style={{ width: 1, height: 1, opacity: 0, position: "absolute" }}
              maxLength={6}
              value={code}
              onChangeText={(text) => !/[^0-9]/g.test(text) && setCode(text)}
              keyboardType="numeric"
              returnKeyType="done"
              textContentType="oneTimeCode"
              ref={textInputRef}
              onBlur={handleBlur}
            />
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ width: "50%", marginTop: 40 }}
              onPress={async () => {
                let response;
                if (maxLength !== code.length) return handleOnPress();
                if (type === "phone") {
                  response = await checkPhoneNumberVerification({
                    phoneNumber: value,
                    code,
                  });
                } else {
                }

                if (response.error) {
                  setCode("");
                  Vibration.vibrate();
                  return;
                }

                navigation.navigate("Selection");
              }}
            >
              <TextStyle center>Verificar</TextStyle>
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  verificationCodeContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationCode: {
    width: 45,
    height: 45,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Verification;
