import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const styles = StyleSheet.create({
  defaultInput: {
    paddingVertical: 8,
    paddingRight: 12,
    fontSize: 20,
    flexGrow: 1,
  },
  defaultContainer: {
    borderRadius: 8,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const InputStyle = ({
  innerRef,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  numberOfLines,
  editable,
  selectTextOnFocus,
  stylesInput,
  stylesContainer,
  secureTextEntry,
  onFocus,
  onBlur,
  left,
  right,
  defaultValue
}) => {
  const mode = useSelector((state) => state.mode);
  const [isShow, setShow] = useState(false);

  const stylesTakenInput = [
    styles.defaultInput,
    { color: mode === "light" ? light.textDark : dark.textWhite },
    left ? { paddingLeft: 0 } : { paddingLeft: 12 },
    right ? { paddingRight: 0, maxWidth: "70%" } : { paddingRight: 12 },
  ];

  const stylesTakenContainer = [styles.defaultContainer];

  return (
    <View
      style={[
        stylesTakenContainer,
        {
          backgroundColor: mode === "light" ? light.main5 : dark.main2,
        },
        stylesContainer,
      ]}
    >
      {left && <View style={{ marginLeft: 15 }}>{left()}</View>}
      <TextInput
        ref={innerRef}
        value={value}
        style={[stylesTakenInput, stylesInput]}
        selectionColor={mode === "light" ? "#AAAAAA" : light.main2}
        placeholder={placeholder}
        cursorColor={mode === "light" ? light.textDark : dark.textWhite}
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
        defaultValue={defaultValue}
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={{ width: "12%" }}
          onPress={() => setShow(!isShow)}
        >
          <Ionicons
            name={isShow ? "eye" : "eye-off"}
            size={25}
            color={light.main2}
          />
        </TouchableOpacity>
      )}
      {right && <View style={{ marginRight: 15 }}>{right()}</View>}
    </View>
  );
};

export default InputStyle;
