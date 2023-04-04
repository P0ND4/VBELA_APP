import { Text, StyleSheet, Dimensions } from 'react-native'
import theme from '../theme';

const light = theme.colors.light;
const width = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  default: {
    fontSize: 23,
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
  children,
}) => {
  const stylesTaken = [
    styles.default,
    bigTitle && { fontSize: Math.floor(width / 8.1) },
    title && { fontSize: Math.floor(width / 8.8) },
    smallTitle && { fontSize: Math.floor(width / 10.1) },
    bigSubtitle && { fontSize: Math.floor(width / 11) },
    subtitle && { fontSize: Math.floor(width / 12) },
    smallSubtitle && { fontSize: Math.floor(width / 13.1) },
    bigParagraph && { fontSize: Math.floor(width / 14.6) },
    paragrahp && { fontSize: Math.floor(width / 16.4) },
    smallParagraph && { fontSize: Math.floor(width / 18.8) },
    verySmall && { fontSize: Math.floor(width / 23.2) },
    color && { color },
    center && { textAlign: 'center' },
    justify && { textAlign: 'justify' },
    customStyle
  ]

  return <Text style={stylesTaken}>{children}</Text>
}

export default TextStyle