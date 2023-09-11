import { useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getExpoID } from "@helpers/libs";
import { addUser } from "@api";
import { change as changeMode } from "@features/settings/modeSlice";
import { change as changeUser } from "@features/user/informationSlice";
import { change as changeHelper } from "@features/helpers/informationSlice";
import { change as changeSettings } from "@features/settings/settingsSlice";
import { change as changeLanguage } from "@features/settings/languageSlice";
import { active } from "@features/user/sessionSlice";
import changeGeneralInformation from "@helpers/changeGeneralInformation";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import LoadingSession from "@components/LoadingSession";
import theme from "@theme";

import SALES from "@assets/login/sales.png";
import ACCOMODATION from "@assets/login/accomodation.png";
import BOTH from "@assets/login/both.png";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Selection = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);

  const dispatch = useDispatch();

  const identifier = route.params.value;

  useEffect(() => {
    (async () => {
      const token = await getExpoID();
      if (!token) return;
      setExpoPushToken(token);
    })();
  }, []);

  const sendInformation = async ({ type }) => {
    setLoading(true);
    setPercentage(50);
    setModalVisible(true);
    let data = await addUser({ identifier, expoID: expoPushToken, type });

    if (data.error) {
      setLoading(false);
      setModalVisible(false);
      setPercentage(0);
      return alert("Ha ocurrido un problema al iniciar sesión");
    }

    dispatch(changeMode(data.mode));
    changeGeneralInformation(dispatch, data);
    dispatch(changeUser(data));
    dispatch(changeLanguage(data.settings.language));
    dispatch(changeSettings(data.settings));
    dispatch(changeHelper(data.helpers));

    setPercentage(100);
    setTimeout(() => {
      dispatch(active());
      navigation.popToTop();
      navigation.replace("App");
    }, 1000);
  };

  const Card = ({ source, title, description, type }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: mode === "light" ? light.main5 : dark.main2,
            opacity: loading ? 0.6 : 1,
          },
        ]}
        onPress={() => !loading && sendInformation({ type })}
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
            type="sales"
          />
          <Card
            title="Alojamiento"
            source={ACCOMODATION}
            description="Buena para el manejo de hoteleros, inquilinos o resort"
            type="accommodation"
          />
          <Card
            title="Alojamiento + Ventas"
            source={BOTH}
            description="Esta opción incluye las dos opciones anteriores"
            type="both"
          />
        </ScrollView>
      </View>
      <LoadingSession modalVisible={modalVisible} percentage={percentage} />
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
