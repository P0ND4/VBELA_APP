import React from "react";
import { useTheme } from "@react-navigation/native";
import StyledText from "./StyledText";

type StyledTextInformation = {
  label: string;
  value: string;
  labelColor?: string;
  valueColor?: string;
};

const StyledTextInformation: React.FC<StyledTextInformation> = ({
  label,
  value,
  labelColor,
  valueColor,
}) => {
  const { colors } = useTheme();

  return (
    <StyledText color={labelColor || colors.text}>
      {label}: <StyledText color={valueColor || colors.primary}>{value}</StyledText>
    </StyledText>
  );
};

export default StyledTextInformation;
