import { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Table = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);

  const [order, setFound] = useState(null);

  const getTextColor = (mode) => (mode === "light" ? dark.textWhite : light.textDark);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? dark.main2 : light.main4);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  useEffect(() => {
    setFound(orders.find((o) => o.ref === item.id && ["kitchen", "pending"].includes(o.status)));
  }, [orders]);

  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => navigation.navigate("TableInformation", { id: item.id })}>
        <TextStyle
          color={!order ? light.main2 : backgroundColor}
          style={{ marginRight: 8 }}
          smallSubtitle
        >
          {item.table}
        </TextStyle>
      </TouchableOpacity>
      <ButtonStyle
        style={{ width: SCREEN_WIDTH / 1.6 }}
        backgroundColor={!order ? light.main2 : backgroundColor}
        onPress={() => {
          navigation.navigate("RestaurantCreateOrder", {
            ref: item.id,
            title: { name: "Mesa", value: item.table },
            order,
          });
        }}
      >
        <View style={[styles.row, { justifyContent: "center" }]}>
          <TextStyle color={!order ? dark.textWhite : textColor} style={{ fontSize: SCREEN_WIDTH / 19 }}>
            Menu
          </TextStyle>
          <Ionicons
            name="book-outline"
            size={getFontSize(17)}
            style={{ marginLeft: 10 }}
            color={!order ? dark.textWhite : textColor}
          />
        </View>
      </ButtonStyle>
      <Ionicons
        name={order ? "receipt-outline" : "checkbox"}
        size={getFontSize(31)}
        color={!order ? light.main2 : backgroundColor}
      />
    </View>
  );
};

const Tables = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const tables = useSelector((state) => state.tables);

  const [found, setFound] = useState(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [AMPM, setAMPM] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const getDate = () => {
      const date = new Date();
      let hour = date.getHours();

      if (hour >= 12) setAMPM("PM");
      else setAMPM("AM");

      if (hour > 12) hour -= 12;

      setHours(hour);
      setMinutes(("0" + date.getMinutes()).slice(-2));
      setSeconds(("0" + date.getSeconds()).slice(-2));
    };
    getDate();
    const interval = setInterval(() => getDate(), 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => setFound(tables), [tables]);

  return (
    <Layout>
      <View style={{ width: "100%" }}>
        <View style={styles.row}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextStyle smallTitle color={light.main2}>
              Hoy
            </TextStyle>
            <TextStyle style={{ marginLeft: 10 }} color={textColor}>
              {`${hours}:${minutes}:${seconds} ${AMPM}`}
            </TextStyle>
          </View>
          {tables?.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate("CreateTable")}>
              <Ionicons name="add-circle" size={getFontSize(32)} color={light.main2} />
            </TouchableOpacity>
          )}
        </View>
        <TextStyle bigParagraph color={textColor}>
          Disponibles
        </TextStyle>
      </View>
      <View>
        <View style={[styles.row, { marginVertical: 30 }]}>
          <TextStyle bigParagraph color={textColor}>
            Mesas
          </TextStyle>
        </View>
        {found !== null ? (
          <FlatList
            data={found}
            style={{ maxHeight: SCREEN_HEIGHT / 1.5 }}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <Table item={item} />}
          />
        ) : (
          <ActivityIndicator size="small" color={light.main2} />
        )}
        {found?.length === 0 && (
          <ButtonStyle onPress={() => navigation.navigate("CreateTable")} backgroundColor={light.main2}>
            <TextStyle center>Agregar mesa</TextStyle>
          </ButtonStyle>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Tables;
