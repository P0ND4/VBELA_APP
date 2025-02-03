import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import { batch } from "react-redux";
import { changeAll } from "application/store/actions";
import { login } from "infrastructure/auth/login";
import { change } from "application/slice/user/user.slice";
import { active } from "application/slice/user/session.slice";
import { useAppDispatch } from "application/store/hook";

type VerificationScreenProps = {
  description: string;
  checkHandler: (code: string) => Promise<boolean>;
  identifier: string;
};

const VerificationScreen: React.FC<VerificationScreenProps> = ({
  description,
  checkHandler,
  identifier,
}) => {
  const { colors } = useTheme();

  const [inputContainerIsFocused, setInputContainerIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  const dispatch = useAppDispatch();

  const textInputRef = useRef<TextInput>(null);

  const maxLength = 6;
  const codeDigitsArray = new Array(maxLength).fill(0);

  useEffect(() => {
    if (maxLength === code.length) Keyboard.dismiss();
  }, [code]);

  const handleBlur = () => setInputContainerIsFocused(false);

  const handleOnPress = () => {
    setInputContainerIsFocused(true);
    textInputRef?.current?.focus();
  };

  const handleTextChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setCode(numericText);
  };

  const toCodeDigitInput = (_: number, index: number) => {
    const emptyInputChar = " ";
    const digit = code[index] || emptyInputChar;

    return (
      <TouchableWithoutFeedback onPress={handleOnPress} key={index}>
        <View
          style={[
            styles.verificationCode,
            {
              backgroundColor:
                inputContainerIsFocused && index === code.length ? colors.primary : colors.card,
            },
          ]}
        >
          <StyledText
            color={inputContainerIsFocused && index === code.length ? "#000000" : colors.text}
          >
            {digit}
          </StyledText>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const handleVerification = async () => {
    setLoading(true);

    const validated = await checkHandler(code);

    if (!validated) {
      Vibration.vibrate();
      setCode("");
    } else {
      const user = await login(identifier);

      if (user) {
        batch(() => {
          dispatch(changeAll(user));
          dispatch(change({ identifier }));
          dispatch(active());
        });
      }
    }

    setLoading(false);
  };

  return (
    <Layout>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} keyboardVerticalOffset={80}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
          <View style={styles.contentContainer}>
            <Image
              source={require("presentation/assets/auth/verification/sent.gif")}
              style={styles.image}
            />
            <View>
              <StyledText center color={colors.primary} subtitle>
                ¡ENVIADO!
              </StyledText>
              <StyledText smallParagraph center style={styles.description}>
                {description}
              </StyledText>
            </View>
            <View style={styles.verificationCodeContainer}>
              {codeDigitsArray.map(toCodeDigitInput)}
            </View>
            <TextInput
              style={styles.hiddenInput}
              maxLength={maxLength}
              value={code}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              returnKeyType="done"
              textContentType="oneTimeCode"
              ref={textInputRef}
              onBlur={handleBlur}
            />
            <StyledButton
              backgroundColor={colors.primary}
              style={styles.verifyButton}
              onPress={handleVerification}
              disable={loading || code.length < maxLength}
            >
              {loading ? (
                <ActivityIndicator size={21} color="#FFFFFF" />
              ) : (
                <StyledText center color="#FFFFFF">
                  Verificar
                </StyledText>
              )}
            </StyledButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0.7,
  },
  image: {
    width: 250,
    height: 250,
  },
  description: {
    marginTop: 8,
  },
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
  hiddenInput: {
    width: 1,
    height: 1,
    opacity: 0,
    position: "absolute",
  },
  verifyButton: {
    width: "50%",
    marginTop: 40,
  },
});

export default VerificationScreen;
