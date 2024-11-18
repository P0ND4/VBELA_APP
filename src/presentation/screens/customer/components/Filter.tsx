import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";
import { StyleSheet, TouchableOpacity } from "react-native";

type FilterProps = {
  onPress: () => void;
  value: boolean;
  name: string;
};

const Filter: React.FC<FilterProps> = ({ onPress, value, name }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filter,
        {
          borderColor: value ? "transparent" : colors.border,
          backgroundColor: value ? colors.primary : "transparent",
        },
      ]}
    >
      <StyledText verySmall color={value ? "#FFFFFF" : colors.text}>
        {name}
      </StyledText>
      {value && (
        <Ionicons style={{ marginLeft: 2 }} name="close-outline" color="#FFFFFF" size={15} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filter: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 2,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
});

export default Filter;
