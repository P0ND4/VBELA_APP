import React from "react";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import CountriesImages from "presentation/assets/countries";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { Country } from "domain/entities/shared/Country";

type CountryCode = keyof typeof CountriesImages;

type FlagButtonProps = {
  onPress?: () => void;
  activate?: boolean;
  country?: Country;
};

const FlagButton: React.FC<FlagButtonProps> = ({ onPress, activate, country }) => {
  const { colors } = useTheme();
  const countryShortName = country?.country_short_name.toLowerCase() as CountryCode;

  return (
    <TouchableOpacity
      style={[styles.flagButton, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      {country && (
        <Image
          source={CountriesImages[countryShortName]}
          style={{ width: 20, height: 20, borderRadius: 20 }}
        />
      )}
      <StyledText style={{ marginHorizontal: 5 }} smallParagraph>
        +{country?.country_phone_code}
      </StyledText>
      <Ionicons name={activate ? "caret-up" : "caret-down"} color={colors.text} size={10} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flagButton: {
    width: 94,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 5,
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
  },
});

export default FlagButton;
