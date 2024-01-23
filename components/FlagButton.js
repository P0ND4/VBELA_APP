import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize } from "@helpers/libs";
import CountriesImages from "@assets/countries";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from '@theme';

const { light, dark } = theme();

const FlagButton = ({ onPress, arrow, selection }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <TouchableOpacity
      style={[
        styles.flagButton,
        styles.row,
        { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
      ]}
      onPress={onPress}
    >
      {selection && (
        <Image
          source={CountriesImages[selection?.country_short_name?.toLowerCase()]}
          style={{ width: 20, height: 20, borderRadius: 20 }}
        />
      )}
      <TextStyle
        style={{ marginHorizontal: 5 }}
        color={mode === "light" ? light.textDark : dark.textWhite}
        smallParagraph
      >
        +{selection?.country_phone_code}
      </TextStyle>
      <Ionicons
        name={arrow ? "caret-up" : "caret-down"}
        color={mode === "light" ? `${light.textDark}66` : `${dark.textWhite}66`}
        size={getFontSize(12)}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flagButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "30%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default FlagButton;
