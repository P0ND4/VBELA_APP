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
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import VerificationImage from "@assets/login/verification.png";
import { getExpoID } from "@helpers/libs";
import LoadingSession from "@components/LoadingSession";
import { change as changeMode } from "@features/settings/modeSlice";
import { change as changeUser } from "@features/user/informationSlice";
import { change as changeHelper } from "@features/helpers/informationSlice";
import { change as changeSettings } from "@features/settings/settingsSlice";
import { change as changeLanguage } from "@features/settings/languageSlice";
import { active } from "@features/user/sessionSlice";
import changeGeneralInformation from "@helpers/changeGeneralInformation";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";
import {
  checkEmailVerification,
  checkPhoneNumberVerification,
  addUser,
} from "@api";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Verification = ({ navigation, route }) => {
  const mode = useSelector((state) => state.mode);

  const [percentage, setPercentage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputContainerIsFocused, setInputContainerIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  //TODO TERMINAR ESTA PARTE
  //TODO Agregar llamada si se registro con numero de telefono

  const textInputRef = useRef(null);

  const maxLength = 6;
  const codeDigitsArray = new Array(maxLength).fill(0);
  const { type, value } = route.params;

  const [expoPushToken, setExpoPushToken] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const token = await getExpoID();
      if (!token) return;
      setExpoPushToken(token);
    })();
  }, []);

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
                {value} (valido por 5 minutos)
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
                if (loading) return;
                if (maxLength !== code.length) return handleOnPress();
                setLoading(true);
                if (type === "phone") {
                  response = await checkPhoneNumberVerification({
                    phoneNumber: value,
                    code,
                  });
                } else {
                  response = await checkEmailVerification({
                    email: value,
                    code,
                  });
                }

                if (response.error) {
                  setLoading(false);
                  setCode("");
                  Vibration.vibrate();
                  return;
                }

                let data = await addUser({
                  identifier: value,
                  expoID: expoPushToken,
                });
                setLoading(false);
                if (data.error)
                  return alert("Ha ocurrido un error");
                if (!data.type)
                  return navigation.replace("Selection", { value });
                setModalVisible(true);
                dispatch(changeMode(data.mode));
                changeGeneralInformation(dispatch, data);
                dispatch(changeUser(data));
                dispatch(changeLanguage(data.settings.language));
                dispatch(changeSettings(data.settings));
                dispatch(changeHelper(data.helpers));

                setPercentage(100);
                setTimeout(() => {
                  dispatch(active());
                  navigation.popToTop();
                  navigation.replace("App");
                }, 1000);
              }}
            >
              {loading && (
                <ActivityIndicator size={21} color={light.textDark} />
              )}
              {!loading && <TextStyle center>Verificar</TextStyle>}
            </ButtonStyle>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingSession modalVisible={modalVisible} percentage={percentage}/>
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
