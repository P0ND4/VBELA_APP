import { Text, StyleSheet } from 'react-native'
import theme from '@theme';

const light = theme.colors.light;

const styles = StyleSheet.create({
  default: {
    fontSize: 20,
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
  bold
}) => {
  const stylesTaken = [
    styles.default,
    bigTitle && { fontSize: 45 },
    title && { fontSize: 40 },
    smallTitle && { fontSize: 35 },
    bigSubtitle && { fontSize: 32 },
    subtitle && { fontSize: 28 },
    smallSubtitle && { fontSize: 25 },
    bigParagraph && { fontSize: 21 },
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

  return <Text style={stylesTaken}>{children}</Text>
}

export default TextStyle