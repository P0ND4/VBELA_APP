import { useState, useEffect, useMemo } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, thousandsSystem, changeDate } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Table = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
        <TextStyle verySmall color={textColor}>
          {changeDate(new Date(item.creationDate))}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
        <TextStyle verySmall color={textColor}>
          {item.quantity}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor }]}>
        <TextStyle verySmall color={textColor}>
          {item.paid}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
        <TextStyle verySmall color={textColor}>
          {item.type === "sale" ? "P&S" : "Restaurante"}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
        <TextStyle verySmall color={textColor}>
          {thousandsSystem(item.total)}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor }]}>
        <TextStyle verySmall color={textColor}>
          {item.payment}
        </TextStyle>
      </View>
    </View>
  );
};

const Sales = () => {
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const customers = useSelector((state) => state.customers);

  const [details, setDetails] = useState([]);
  const [type, setType] = useState("paid");

  const getBackgroundColorContrast = (mode) => (mode === "light" ? dark.main2 : light.main5);
  const backgroundColorContrast = useMemo(() => getBackgroundColorContrast(mode), [mode]);
  const getTextColorContrast = (mode) => (mode === "light" ? dark.textWhite : light.textDark);
  const textColorContrast = useMemo(() => getTextColorContrast(mode), [mode]);
  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const condition = (o) =>
      customers.some((c) => c.id === o.ref || c.clientList?.some((cc) => cc.id === o.ref));

    const foundOrders = orders.filter(condition).map((o) => ({ ...o, type: "order" }));
    const foundSales = sales.filter(condition).map((o) => ({ ...o, type: "sale" }));

    const union = [...foundOrders, ...foundSales]
      .filter((o) => o.status === type)
      .map((o) => ({
        ...o,
        payment: o.selection.reduce((a, b) => a + b.method.reduce((a, b) => a + b.total, 0), 0),
      }));

    const details = union.sort((a, b) => {
      if (a.creationDate < b.creationDate) return -1;
      if (a.creationDate > b.creationDate) return 1;
      return 0;
    });

    setDetails(details);
  }, [orders, sales, customers, type]);

  return (
    <Layout>
      <View style={[styles.row, { marginBottom: 15 }]}>
        <ButtonStyle
          backgroundColor={type === "paid" ? backgroundColorContrast : light.main2}
          style={styles.equality}
          onPress={() => setType("paid")}
        >
          <TextStyle color={type === "paid" ? textColorContrast : light.textDark} center smallParagraph>
            PAGADO
          </TextStyle>
        </ButtonStyle>
        <ButtonStyle
          backgroundColor={type === "pending" ? backgroundColorContrast : light.main2}
          style={[styles.equality, { marginHorizontal: 5 }]}
          onPress={() => setType("pending")}
        >
          <TextStyle
            color={type === "pending" ? textColorContrast : light.textDark}
            center
            smallParagraph
          >
            PENDIENTE
          </TextStyle>
        </ButtonStyle>
      </View>
      <View>
        <View style={styles.header}>
          <TextStyle smallParagraph>LISTADO DE VENTAS</TextStyle>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT / 1.38 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={{ flexDirection: "row" }}>
                <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    FECHA
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    CANTIDAD
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor }]}>
                  <TextStyle smallParagraph color={textColor}>
                    PAGADO
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    DETALLE
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, width: 83 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    VALOR
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor }]}>
                  <TextStyle smallParagraph color={textColor}>
                    PAGADO
                  </TextStyle>
                </View>
              </View>
              <FlatList
                data={details}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                initialNumToRender={4}
                renderItem={({ item }) => <Table item={item} />}
              />
            </View>
          </ScrollView>
        </ScrollView>
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
  equality: {
    width: "auto",
    flexGrow: 1,
  },
  search: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
  header: {
    width: "100%",
    backgroundColor: light.main2,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Sales;
