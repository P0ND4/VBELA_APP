import { Text, StyleSheet } from 'react-native'
import theme from '@theme';

const light = theme.colors.light;

const styles = StyleSheet.create({
  default: {
    fontSize: 18,
    color: light.textDark
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
  onPress
}) => {
  const stylesTaken = [
    styles.default,
    bigTitle && { fontSize: 40 },
    title && { fontSize: 35 },
    smallTitle && { fontSize: 32 },
    bigSubtitle && { fontSize: 28 },
    subtitle && { fontSize: 26 },
    smallSubtitle && { fontSize: 23 },
    bigParagraph && { fontSize: 20 },
    paragrahp && { fontSize: 18 },
    smallParagraph && { fontSize: 15 },
    verySmall && { fontSize: 13 },
    color && { color },
    center && { textAlign: 'center' },
    justify && { textAlign: 'justify' },
    right && { textAlign: 'right' },
    bold && { fontWeight: 'bold' },
    customStyle
  ]

  return <Text onPress={onPress} style={stylesTaken}>{children}</Text>
}

export default TextStyle