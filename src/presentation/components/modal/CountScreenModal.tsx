import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "../button/StyledButton";

type IoniconsName = keyof typeof Ionicons.glyphMap;

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
  value?: number | string;
  onChange?: (value: number | string) => void;
  onSave?: () => void;
  maxValue?: number;
  description?: string;
  buttonText?: string;
  condition?: boolean;
  decimal?: boolean;
};

export const Pad: React.FC<PadPros> = ({
  value,
  onChange = () => {},
  onSave = () => {},
  maxValue,
  description,
  buttonText,
  condition,
  decimal,
}) => {
  const { colors } = useTheme();

  const convert = (event: string) => {
    let newValue = String(value);

    if (event === "back") newValue = newValue.slice(0, -1) || "0";
    else if (event === ".") {
      if (newValue.includes(".")) return;
      newValue = newValue + ".";
    } else newValue = newValue + event;

    const numericValue = newValue.endsWith(".") ? newValue : parseFloat(newValue);

    if (!maxValue || Number(numericValue) <= maxValue) onChange(numericValue);
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
            {decimal ? <Button content="." onPress={() => convert(".")} /> : <Button />}
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

type CountScreenProps = {
  title: string;
  description?: (count: number | string) => string;
  padDescription?: (count: number | string) => string;
  headerRight?: () => React.ReactNode;
  numericComponent?: (count: number | string) => React.ReactNode;
  visible: boolean;
  isRemove?: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  condition?: (count: number | string) => boolean;
  defaultValue?: number;
  negativeNumber?: boolean;
  maxValue?: number;
  buttonText?: string;
  decimal?: boolean;
  increasers?: boolean;
};

const CountScreenModal: React.FC<CountScreenProps> = ({
  title,
  description,
  padDescription,
  visible,
  onClose,
  defaultValue = 1,
  isRemove,
  onSave,
  negativeNumber,
  maxValue = 999,
  headerRight,
  numericComponent,
  condition,
  buttonText = "Guardar",
  decimal = false,
  increasers = true,
}) => {
  const { colors } = useTheme();

  const [count, setCount] = useState<number | string>(1);

  useEffect(() => {
    visible && setCount(Math.abs(defaultValue));
  }, [visible]);

  return (
    <ScreenModal title={title} visible={visible} onClose={onClose} headerRight={headerRight}>
      <View style={{ flex: 1 }}>
        <View style={[styles.center, { flex: 2 }]}>
          {description && <StyledText>{description(count)}</StyledText>}
          <View style={styles.valueContainer}>
            {increasers && (
              <TouchableOpacity
                style={{ flexShrink: 0 }}
                onPress={() => Number(count) >= 1 && setCount(Number(count) - 1)}
              >
                <Ionicons name="remove" size={40} color={colors.text} />
              </TouchableOpacity>
            )}
            <StyledText bigTitle center color={colors.primary} style={{ flexGrow: 1 }}>
              {thousandsSystem(count)}
            </StyledText>
            {increasers && (
              <TouchableOpacity
                style={{ flexShrink: 0 }}
                onPress={() => Number(count) < maxValue && setCount(Number(count) + 1)}
              >
                <Ionicons name="add" size={40} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
          {numericComponent && numericComponent(count)}
          {isRemove && (
            <TouchableOpacity
              style={{ marginTop: 15 }}
              onPress={() => {
                onSave(0);
                onClose();
              }}
            >
              <StyledText color={colors.primary} smallSubtitle style={{ marginTop: 15 }}>
                Eliminar
              </StyledText>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 4 }}>
          <Pad
            value={count}
            description={padDescription && padDescription(count)}
            onChange={(count: number | string) => setCount(count)}
            buttonText={buttonText}
            maxValue={maxValue}
            condition={condition ? condition(count) : Number(count) >= 1} // VALIDAR CONDICIONES
            decimal={decimal}
            onSave={() => {
              onSave(Number(count) * (negativeNumber ? -1 : 1));
              onClose();
            }}
          />
        </View>
      </View>
    </ScreenModal>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  valueContainer: {
    paddingHorizontal: 30,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  padContainer: { flexGrow: 1, width: "100%", justifyContent: "flex-end" },
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

export default CountScreenModal;
