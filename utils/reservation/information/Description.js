import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const Description = ({
  style = {},
  cost = "CARGANDO",
  debt,
  status = "CARGANDO",
  tip,
  payment,
  type = "CARGANDO",
  hosted = "CARGANDO",
  days = "CARGANDO",
  start = "CARGANDO",
  end = "CARGANDO",
}) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={style}>
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Costo de alojamiento: </TextStyle>
        <TextStyle color={light.main2}>{cost}</TextStyle>
      </View>
      {debt && (
        <View style={styles.rowTogether}>
          <TextStyle color={textColor}>Deuda pendiente: </TextStyle>
          <TextStyle color={light.main2}>{debt}</TextStyle>
        </View>
      )}
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Estado: </TextStyle>
        <TextStyle color={light.main2}>{status}</TextStyle>
      </View>
      {payment && (
        <View style={styles.rowTogether}>
          <TextStyle color={textColor}>Dinero pagado: </TextStyle>
          <TextStyle color={light.main2}>{payment}</TextStyle>
        </View>
      )}
      {tip && (
        <View style={styles.rowTogether}>
          <TextStyle color={textColor}>Propina: </TextStyle>
          <TextStyle color={light.main2}>{tip}</TextStyle>
        </View>
      )}
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Tipo de alojamiento: </TextStyle>
        <TextStyle color={light.main2}>{type}</TextStyle>
      </View>
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Personas alojadas: </TextStyle>
        <TextStyle color={light.main2}>{hosted}</TextStyle>
      </View>
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Días reservado: </TextStyle>
        <TextStyle color={light.main2}>{days}</TextStyle>
      </View>
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Fecha de registro: </TextStyle>
        <TextStyle color={light.main2}>{start}</TextStyle>
      </View>
      <View style={styles.rowTogether}>
        <TextStyle color={textColor}>Fecha de finalización: </TextStyle>
        <TextStyle color={light.main2}>{end}</TextStyle>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowTogether: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Description;
