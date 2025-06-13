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
  paragraph?: boolean;
  smallParagraph?: boolean;
  verySmall?: boolean;
  center?: boolean;
  justify?: boolean;
  right?: boolean;
  children?: React.ReactNode;
  bold?: boolean;
  lineThrough?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: "middle" | "head" | "tail" | "clip" | undefined;
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
  paragraph,
  smallParagraph,
  verySmall,
  center,
  justify,
  right,
  children,
  bold,
  lineThrough,
  ellipsizeMode,
  numberOfLines,
  onPress,
  enableDarkMode = true,
}) => {
  const { colors } = useTheme();

  const stylesTaken: StyleProp<TextStyle> = [
    { fontSize: 15, flexShrink: 1, flexWrap: "wrap" },
    bigTitle && { fontSize: 32 },
    title && { fontSize: 30 },
    smallTitle && { fontSize: 27 },
    bigSubtitle && { fontSize: 24 },
    subtitle && { fontSize: 22 },
    smallSubtitle && { fontSize: 20 },
    bigParagraph && { fontSize: 17 },
    paragraph && { fontSize: 15 },
    smallParagraph && { fontSize: 13 },
    verySmall && { fontSize: 11 },
    color ? { color: color } : { color: enableDarkMode ? colors.text : "#000000" },
    center && { textAlign: "center" },
    justify && { textAlign: "justify" },
    right && { textAlign: "right" },
    bold && { fontWeight: "700" },
    lineThrough && { textDecorationLine: "line-through" },
    style,
  ];

  return (
    <Text
      onPress={onPress}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={stylesTaken}
    >
      {children}
    </Text>
  );
};

export default StyledText;
