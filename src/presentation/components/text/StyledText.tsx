import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

type TextProps = {
  color?: string;
  style?: StyleProp<TextStyle>;
  bigTitle?: boolean;
  title?: boolean;
  smallTitle?: boolean;
  bigSubtitle?: boolean;
  subtitle?: boolean;
  smallSubtitle?: boolean;
  bigParagraph?: boolean;
  paragrahp?: boolean;
  smallParagraph?: boolean;
  verySmall?: boolean;
  center?: boolean;
  justify?: boolean;
  right?: boolean;
  children?: React.ReactNode;
  bold?: boolean;
  lineThrough?: boolean;
  onPress?: () => void;
  enableDarkMode?: boolean;
};

const StyledText: React.FC<TextProps> = ({
  color,
  style,
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
  lineThrough,
  onPress,
  enableDarkMode = true,
}) => {
  const { colors } = useTheme();

  const stylesTaken: StyleProp<TextStyle> = [
    { fontSize: 18 },
    bigTitle && { fontSize: 40 },
    title && { fontSize: 35 },
    smallTitle && { fontSize: 32 },
    bigSubtitle && { fontSize: 28 },
    subtitle && { fontSize: 26 },
    smallSubtitle && { fontSize: 23 },
    bigParagraph && { fontSize: 20 },
    paragrahp && { fontSize: 18 },
    smallParagraph && { fontSize: 14 },
    verySmall && { fontSize: 13 },
    color ? { color: color } : { color: enableDarkMode ? colors.text : "#000000" },
    center && { textAlign: "center" },
    justify && { textAlign: "justify" },
    right && { textAlign: "right" },
    bold && { fontWeight: "bold" },
    lineThrough && { textDecorationLine: "line-through" },
    style,
  ];

  return (
    <Text onPress={onPress} style={stylesTaken}>
      {children}
    </Text>
  );
};

export default StyledText;
