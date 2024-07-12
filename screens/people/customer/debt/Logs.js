import { useState, useEffect, useMemo } from "react";
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { changeDate, thousandsSystem } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const [isOpen, setOpen] = useState(false);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={{ marginBottom: 5 }}>
      <TouchableOpacity
        onPress={() => setOpen(!isOpen)}
        style={[
          styles.header,
          {
            borderWidth: 0.2,
            borderColor: textColor,
            backgroundColor: light.main2,
          },
        ]}
      >
        <TextStyle verySmall>{item.name}</TextStyle>
        <Ionicons name={isOpen ? "caret-up" : "caret-down"} />
      </TouchableOpacity>
      {isOpen && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
                <TextStyle color={light.main2} verySmall>
                  Fecha
                </TextStyle>
              </View>
              <View style={[styles.table, { borderColor: textColor, width: 200 }]}>
                <TextStyle color={light.main2} verySmall>
                  Descripción
                </TextStyle>
              </View>
              <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
                <TextStyle color={light.main2} verySmall>
                  Tipo
                </TextStyle>
              </View>
              <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
                <TextStyle color={light.main2} verySmall>
                  Valor
                </TextStyle>
              </View>
            </View>
            <FlatList
              data={item?.logs || []}
              initialNumToRender={6}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row" }}>
                  <View style={[styles.table, styles.center, { borderColor: textColor, width: 85 }]}>
                    <TextStyle color={textColor} verySmall>
                      {changeDate(new Date(item.creationDate), { time: true })}
                    </TextStyle>
                  </View>
                  <View style={[styles.table, { borderColor: textColor, width: 200 }]}>
                    <TextStyle color={textColor} justify verySmall>
                      {item.description}
                    </TextStyle>
                  </View>
                  <View style={[styles.table, styles.center, { borderColor: textColor, width: 70 }]}>
                    <TextStyle color={textColor} verySmall>
                      {item.type === "pay" ? "Abono" : "Reembolso"}
                    </TextStyle>
                  </View>
                  <View style={[styles.table, styles.center, { borderColor: textColor, width: 100 }]}>
                    <TextStyle color={textColor} verySmall>
                      {thousandsSystem(item.value)}
                    </TextStyle>
                  </View>
                </View>
              )}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const Logs = ({ route }) => {
  const mode = useSelector((state) => state.mode);
  const bills = useSelector((state) => state.bills);
  const customers = useSelector((state) => state.customers);

  const [logs, setLogs] = useState(null);
  const [paid, setPaid] = useState([]);

  const id = route.params?.id;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    // Declaramos una función para organizar todos los registros que se le pasen
    const sort = (logs) => {
      const sorted = [...logs].sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

      return sorted.reduce((acc, log) => {
        // Buscamos y definimos quien es el cliente, de no existir se especifica
        const customer = customers.find((c) => c.id === log.ref);
        const name = customer ? customer.name : "Eliminado";

        // Buscar el cliente o el bill no encontrado en el acumulador
        const index = acc.findIndex((item) => item.name === name && item.id === log.ref);

        // Validamos si esta registrado el cliente de ser asi solo se agrega el log de lo contrario se crea el registro
        if (index >= 0) acc[index].logs.push(log);
        else acc.push({ name, id: customer?.id || log?.id, logs: [log] });

        return acc;
      }, []);
    };

    // Vemos si es individual o general
    const sorted = id ? sort(bills.filter((b) => b.ref === id)) : sort(bills);
    setPaid(sorted?.reduce((acc, b) => [...acc, ...b.logs], []));
    if (id) setLogs(sorted);
    else setLogs(sorted);
  }, [id, customers, bills]);

  return (
    <Layout>
      {logs?.length > 0 && (
        <View>
          <TextStyle subtitle color={textColor}>
            Registros
          </TextStyle>
          <TextStyle smallParagraph color={textColor}>
            Abono total:{" "}
            <TextStyle smallParagraph color={light.main2}>
              {thousandsSystem(
                paid?.reduce((a, b) => {
                  const value = b.type === "pay" ? b.value : -b.value;
                  return a + value;
                }, 0) || "0"
              )}
            </TextStyle>
          </TextStyle>
        </View>
      )}
      {logs?.length === 0 && (
        <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
          NO HAY REGISTROS
        </TextStyle>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
        {logs?.map((item) => (
          <View key={item.id}>
            <Card item={item} />
          </View>
        ))}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Logs;
