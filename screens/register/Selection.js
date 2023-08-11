import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  ScrollView
} from "react-native";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import theme from "@theme";

import SALES from "@assets/login/sales.png";
import ACCOMODATION from "@assets/login/accomodation.png";
import BOTH from '@assets/login/both.png';

const light = theme.colors.light;
const dark = theme.colors.dark;

const Selection = () => {
  const mode = useSelector((state) => state.mode);

  const Card = ({ source, title, description }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
        ]}
      >
        <TextStyle subtitle center color={light.main2}>
          {title}
        </TextStyle>

        <Image source={source} style={{ width: 80, height: 80 }} />
        <TextStyle
          smallParagraph
          justify
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {description}
        </TextStyle>
      </TouchableOpacity>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={{ marginBottom: 10 }}>
        <TextStyle subtitle center color={light.main2}>
          ¿Que prefieres?
        </TextStyle>
        <TextStyle
          center
          smallParagraph
          customStyle={{ marginTop: 10 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Queremos conocer tus preferencias y el propósito de uso de la
          aplicación. Por favor, elige la opción que mejor se adapte a tus
          necesidades.
        </TextStyle>
      </View>
      <View style={{ alignItems: "center", maxHeight: 620 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card
              title="Ventas"
              source={SALES}
              description="Excelente para negocios, registro de ventas, y restaurantes"
            />
            <Card
              title="Alojamiento"
              source={ACCOMODATION}
              description="Buena para el manejo de hoteleros, inquilinos o resort"
            />
            <Card
              title="Alojamiento + Ventas"
              source={BOTH}
              description="Esta opción incluye las dos opciones anteriores"
            />
          </ScrollView>
        </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 190,
    marginVertical: 5,
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Selection;
