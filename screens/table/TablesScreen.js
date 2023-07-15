import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;
const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

const Tables = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const tables = useSelector((state) => state.tables);
  const orders = useSelector((state) => state.orders);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [AMPM, setAMPM] = useState("");

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

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={{ width: "100%" }}>
        <View style={styles.header}>
          <View style={styles.titlesContainer}>
            <TextStyle smallTitle color={light.main2}>
              Hoy
            </TextStyle>
            <TextStyle
              customStyle={{ marginLeft: 10 }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {`${hours}:${minutes}:${seconds} ${AMPM}`}
            </TextStyle>
          </View>
          {tables?.length > 0 && (
            <TouchableOpacity onPress={() => navigation.push("CreateTable")}>
              <Ionicons name="add-circle" size={40} color={light.main2} />
            </TouchableOpacity>
          )}
        </View>
        <TextStyle
          bigParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Disponibles
        </TextStyle>
      </View>
      <View>
        <TextStyle
          bigParagraph
          customStyle={{ marginVertical: 30 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Mesas
        </TextStyle>
        <ScrollView style={{ maxHeight: height / 1.5 }}>
          {tables?.map((table) => {
            const OF = orders.find(
              (o) => o.ref === table.id && o.pay === false
            );

            return (
              <View key={table.modificationDate} style={styles.section}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.push("TableInformation", { id: table.id })
                  }
                >
                  <TextStyle
                    color={
                      !OF
                        ? light.main2
                        : mode === "light"
                        ? dark.main2
                        : light.main4
                    }
                    customStyle={{ marginRight: 8 }}
                    smallSubtitle
                  >
                    {table.table}
                  </TextStyle>
                </TouchableOpacity>
                <ButtonStyle
                  style={{ width: width / 1.6 }}
                  backgroundColor={
                    !OF
                      ? light.main2
                      : mode === "light"
                      ? dark.main2
                      : light.main4
                  }
                  onPress={() =>
                    navigation.push("CreateOrder", {
                      editing: OF ? true : false,
                      id: OF ? OF.id : undefined,
                      ref: table.id,
                      table: table.table,
                      selection: OF ? OF.selection : [],
                      reservation: false
                    })
                  }
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle
                      color={
                        !OF
                          ? dark.textWhite
                          : mode === "light"
                          ? dark.textWhite
                          : light.textDark
                      }
                      customStyle={{ fontSize: width / 19 }}
                    >
                      Menu
                    </TextStyle>
                    <Ionicons
                      name="book-outline"
                      size={21}
                      style={{ marginLeft: 10 }}
                      color={
                        !OF
                          ? dark.textWhite
                          : mode === "light"
                          ? dark.textWhite
                          : light.textDark
                      }
                    />
                  </View>
                </ButtonStyle>
                <Ionicons
                  name={OF ? "receipt-outline" : "checkbox"}
                  size={38}
                  color={
                    !OF
                      ? light.main2
                      : mode === "light"
                      ? dark.main2
                      : light.main4
                  }
                />
              </View>
            );
          })}
        </ScrollView>
        {tables?.length === 0 && (
          <ButtonStyle
            onPress={() => navigation.push("CreateTable")}
            backgroundColor={light.main2}
          >
            Agregar mesa
          </ButtonStyle>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titlesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default Tables;
