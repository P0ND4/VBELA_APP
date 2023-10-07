import { Text, StyleSheet } from "react-native";
import { getFontSize } from "@helpers/libs";
import theme from "@theme";

const light = theme.colors.light;

const styles = StyleSheet.create({
  default: {
    fontSize: getFontSize(15),
    color: light.textDark,
  }
});

const TextStyle = ({
  color,
  customStyle,
  bigTitle,
  title,
  smallTitle,
  bigSubtitle,
  subtitle,
  smallSubtitle,
  bigParagraph,
  paragrahp,
  smallParagraph,
  verySmall,
  center,
  justify,
  right,
  children,
  bold,
  onPress,
}) => {
  const stylesTaken = [
    styles.default,
    bigTitle && { fontSize: getFontSize(32) },
    title && { fontSize: getFontSize(28) },
    smallTitle && { fontSize: getFontSize(26) },
    bigSubtitle && { fontSize: getFontSize(23) },
    subtitle && { fontSize: getFontSize(21) },
    smallSubtitle && { fontSize: getFontSize(19) },
    bigParagraph && { fontSize: getFontSize(16) },
    paragrahp && { fontSize: getFontSize(14) },
    smallParagraph && { fontSize: getFontSize(12) },
    verySmall && { fontSize: getFontSize(10) },
    color && { color },
    center && { textAlign: "center" },
    justify && { textAlign: "justify" },
    right && { textAlign: "right" },
    bold && { fontWeight: "bold" },
    customStyle,
  ];

  //numberOfLines={1} PARA QUE SE VEA EN UNA SOLA LINEA
  //adjustsFontSizeToFit PARA QUE SE AJUSTE A LA PANTALLA

  return (
    <Text onPress={onPress} style={stylesTaken}>
      {children}
    </Text>
  );
};

export default TextStyle;
