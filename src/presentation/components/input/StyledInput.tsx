import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  KeyboardTypeOptions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

const styles = StyleSheet.create({
  defaultInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    flexGrow: 1,
    flexShrink: 1,
  },
  defaultContainer: {
    borderRadius: 4,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    width: "100%",
    flexShrink: 0,
  },
  iconContainer: {
    marginHorizontal: 10,
  },
});

type InputProps = {
  ref?: React.RefObject<TextInput>;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  numberOfLines?: number;
  editable?: boolean;
  selectTextOnFocus?: boolean;
  stylesInput?: StyleProp<TextStyle>;
  stylesContainer?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  onFocus?: () => void;
  onKeyPress?: () => void;
  onBlur?: () => void;
  left?: () => React.ReactNode;
  right?: () => React.ReactNode;
  defaultValue?: string;
};

const StyledInput: React.FC<InputProps> = ({
  ref,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  numberOfLines,
  editable = true,
  selectTextOnFocus,
  stylesInput,
  stylesContainer,
  secureTextEntry,
  onFocus,
  onKeyPress,
  onBlur,
  left,
  right,
  defaultValue,
}) => {
  const { colors } = useTheme();

  const [isShow, setShow] = useState(false);

  const stylesTakenInput = [
    styles.defaultInput,
    { color: colors.text, opacity: !editable ? 0.6 : 1 },
  ];
  const stylesTakenContainer = [styles.defaultContainer];

  return (
    <View style={[stylesTakenContainer, { backgroundColor: colors.card }, stylesContainer]}>
      {left && <View style={styles.iconContainer}>{left()}</View>}
      <TextInput
        ref={ref}
        value={value}
        style={[stylesTakenInput, stylesInput]}
        selectionColor={colors.primary}
        placeholder={placeholder}
        cursorColor={colors.text}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry && !isShow}
        editable={editable}
        selectTextOnFocus={selectTextOnFocus}
        placeholderTextColor="#888888"
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        defaultValue={defaultValue}
      />
      {secureTextEntry && (
        <TouchableOpacity style={styles.iconContainer} onPress={() => setShow(!isShow)}>
          <Ionicons name={isShow ? "eye" : "eye-off"} size={25} color={colors.primary} />
        </TouchableOpacity>
      )}
      {right && <View style={styles.iconContainer}>{right()}</View>}
    </View>
  );
};

export default StyledInput;
