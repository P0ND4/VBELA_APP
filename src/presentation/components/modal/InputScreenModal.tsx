import React, { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { thousandsSystem } from "shared/utils";
import ScreenModal from "./ScreenModal";
import StyledText from "../text/StyledText";
import StyledButton from "../button/StyledButton";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  defaultValue?: string;
  title: string;
  placeholder?: string;
  maxLength?: number;
  onSubmit: (value: string) => void;
};

const InputScreenModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  defaultValue = "",
  placeholder = "",
  maxLength = 3000,
  onSubmit,
}) => {
  const { colors } = useTheme();

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    visible && setValue(defaultValue);
  }, [visible]);

  return (
    <ScreenModal
      title={title}
      visible={visible}
      onClose={onClose}
      headerRight={() => (
        <TouchableOpacity
          style={{ marginRight: 25 }}
          onPress={() => {
            onSubmit("");
            onClose();
          }}
        >
          <StyledText color={colors.primary}>Limpiar</StyledText>
        </TouchableOpacity>
      )}
    >
      <View style={{ flex: 1 }}>
        <TextInput
          value={value}
          onChangeText={(text) => text.length <= maxLength && setValue(text)}
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.border}
          placeholder={placeholder}
          multiline={true}
        />
        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <StyledText smallParagraph right style={{ marginBottom: 15 }}>
            {thousandsSystem(value.length)}/{thousandsSystem(maxLength)}
          </StyledText>
          <StyledButton
            noMargin
            backgroundColor={colors.primary}
            onPress={() => {
              onSubmit(value);
              onClose();
            }}
          >
            <StyledText center color="#FFFFFF">
              Guardar
            </StyledText>
          </StyledButton>
        </View>
      </View>
    </ScreenModal>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: 20,
    flexGrow: 1,
    textAlignVertical: "top",
    fontSize: 18,
  },
});

export default InputScreenModal;
