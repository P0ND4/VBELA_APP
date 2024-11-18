import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";

type FooterProps = {
  positive: boolean;
  negative: boolean;
};

const Footer: React.FC<FooterProps> = ({ positive, negative }) => {
  const { colors } = useTheme();

  const renderText = (label: string, color: string, right?: boolean) => (
    <>
      <StyledText right={right}>{label}</StyledText>
      <StyledText style={{ marginTop: 8 }} color={color} right={right}>
        0.00
      </StyledText>
    </>
  );

  return (
    <View style={[styles.footer, styles.row, { backgroundColor: colors.card }]}>
      {positive && !negative && renderText("Saldo por cobrar", "#FF0000")}
      {negative && !positive && renderText("Saldo de créditos", colors.primary, true)}
      {((positive && negative) || (!positive && !negative)) && (
        <>
          <View>{renderText("Saldo por cobrar", "#FF0000")}</View>
          <View>{renderText("Saldo de créditos", colors.primary, true)}</View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    height: 80,
    paddingHorizontal: 20,
  },
});

export default Footer;
