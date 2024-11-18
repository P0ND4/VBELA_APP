import React from "react";
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

type NumericProps = {
  value?: string;
  title?: string;
  onPress?: () => void;
  disable?: boolean;
  name?: string;
  description?: () => React.ReactNode;
  inputStyle?: StyleProp<ViewStyle>;
};

type IoniconsName = keyof typeof Ionicons.glyphMap;

export const Numeric: React.FC<NumericProps> = ({
  value = 0,
  title,
  name,
  description = () => <></>,
  onPress,
  disable,
  inputStyle,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      disabled={disable || !onPress}
      onPress={onPress}
      style={{ alignItems: "center", opacity: disable ? 0.6 : 1 }}
    >
      {title && <StyledText style={{ marginBottom: 8 }}>{title}</StyledText>}
      <StyledText
        color={colors.primary}
        style={[styles.input, { borderColor: colors.border, color: colors.primary }, inputStyle]}
      >
        {value}
      </StyledText>
      {name && (
        <StyledText style={{ marginTop: 15 }} color={colors.primary}>
          {name}
        </StyledText>
      )}
      {description()}
    </TouchableOpacity>
  );
};

type ButtonProps = {
  content?: string;
  onPress?: () => void;
  icon?: IoniconsName;
};

const Button: React.FC<ButtonProps> = ({ content, icon, onPress = () => {} }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.numberContainer}
      onPress={onPress}
      disabled={!(content || icon)}
    >
      {content && <StyledText title>{content}</StyledText>}
      {icon && <Ionicons name={icon} size={35} color={colors.text} />}
    </TouchableOpacity>
  );
};

type PadPros = {
  value?: number;
  onChange?: (value: number) => void;
  onSave?: () => void;
  maxValue?: number;
  description?: string;
  buttonText?: string;
  condition?: boolean;
};

export const Pad: React.FC<PadPros> = ({
  value,
  onChange = () => {},
  onSave = () => {},
  maxValue,
  description,
  buttonText,
  condition,
}) => {
  const { colors } = useTheme();

  const convert = (event: string) => {
    let count = 0;
    if (event === "back") count = parseInt(String(value).slice(0, -1) || "0");
    else count = parseInt(String(value) + event);
    if (!maxValue || count <= maxValue) onChange(count);
  };

  return (
    <View style={styles.padContainer}>
      {description && (
        <View style={[styles.notification, { backgroundColor: colors.notification }]}>
          <StyledText center bold>
            {description}
          </StyledText>
        </View>
      )}
      <View style={{ backgroundColor: colors.card }}>
        <View>
          <View style={[styles.numberRow, { borderColor: colors.border }]}>
            <Button content="1" onPress={() => convert("1")} />
            <Button content="2" onPress={() => convert("2")} />
            <Button content="3" onPress={() => convert("3")} />
          </View>
          <View style={[styles.numberRow, { borderColor: colors.border }]}>
            <Button content="4" onPress={() => convert("4")} />
            <Button content="5" onPress={() => convert("5")} />
            <Button content="6" onPress={() => convert("6")} />
          </View>
          <View style={[styles.numberRow, { borderColor: colors.border }]}>
            <Button content="7" onPress={() => convert("7")} />
            <Button content="8" onPress={() => convert("8")} />
            <Button content="9" onPress={() => convert("9")} />
          </View>
          <View style={[styles.numberRow, { borderColor: "transparent" }]}>
            <Button />
            <Button content="0" onPress={() => convert("0")} />
            <Button icon="backspace-outline" onPress={() => convert("back")} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <StyledButton
            noMargin
            backgroundColor={colors.primary}
            onPress={onSave}
            disable={!condition}
          >
            <StyledText center color="#FFFFFF">
              {buttonText}
            </StyledText>
          </StyledButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  padContainer: { flexGrow: 1, width: "100%", justifyContent: "flex-end" },
  input: {
    borderBottomWidth: 1,
    minWidth: 100,
    textAlign: "center",
    fontSize: 40,
  },
  numberRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  numberContainer: {
    flexGrow: 1,
    flexBasis: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 34,
  },
  notification: {
    width: "100%",
    paddingVertical: 8,
  },
});
