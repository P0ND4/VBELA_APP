import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import { thousandsSystem, print, generatePDF, changeDate } from "@helpers/libs";
import { editInventory } from "@api";
import { edit } from "@features/inventory/informationSlice";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("screen");

const EntryOutputInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const inventory = useSelector((state) => state.inventory);
  const activeGroup = useSelector((state) => state.activeGroup);
  const user = useSelector((state) => state.user);
  const helpers = useSelector((state) => state.helpers);

  const [data, setData] = useState([]);
  const [textEntry, setTextEntry] = useState("");
  const [textOutput, setTextOutput] = useState("");

  const type = route.params.type;
  const inventoryRef = route.params.item;
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions({
      title: `${inventoryRef.name}: ${
        type === "entry" ? "Entrada" : "Salida"
      } De Unidad`,
    });
  }, []);

  useEffect(() => {
    if (type === "entry") {
      setData(
        [
          ...inventory
            .find((i) => i.id === inventoryRef.id)
            .entry.filter((e) => e.entry),
        ].reverse()
      );
    } else {
      setData(
        [...inventory.find((i) => i.id === inventoryRef.id).output].reverse()
      );
    }
  }, [inventory]);

  useEffect(() => {
    setTextOutput("");
    if (type === "output") {
      const text = data.reduce((a, item) => {
        return (
          a +
          `<tr>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                  item?.quantity || 0
                )}</p>
              </td>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                  item?.currentValue || 0
                )}</p>
              </td>
            </tr>`
        );
      }, "");
      setTextOutput(text);
    }
  }, [data]);

  useEffect(() => {
    setTextEntry("");
    if (type === "entry") {
      const text = data.reduce((a, item) => {
        return (
          a +
          `<tr>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                  item?.quantity || 0
                )}</p>
              </td>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                  item?.lastValue || 0
                )}</p>
              </td>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                  item?.currentValue || 0
                )}</p>
              </td>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: 600;">
                  ${item?.currentValue - item?.lastValue > 0 ? "+" : "-"}
                  ${thousandsSystem(
                    Math.abs(item?.currentValue - item?.lastValue)
                  )}
                </p>
              </td>
            </tr>`
        );
      }, "");
      setTextEntry(text);
    }
  }, [data]);

  const htmlOutput = `
  <html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style type="text/css">
  * {
    padding: 0;
    margin: 0;
    box-sizing: 'border-box';
    font-family: sans-serif;
    color: #444444
  }

  @page { margin: 20px; } 
</style>
</head>

<body>
<view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
  <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
    INVENTARIO
  </h2>
  <p style="text-align: center; color: #444444; font-size: 30px; font-weight: 800; margin-bottom: 30px;">
    ${inventoryRef.name.toUpperCase()} - SALIDA
  </p>
  <view style="width: 100%; margin: 20px auto;">
    <table style="width: 100%">
      <tr>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">CANTIDAD</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">PRECIO ACTUAL</p>
          </td>
        </tr>
      ${textOutput.replace(/,/g, "")}
    </table>
    
  </view>
  <p style="text-align: center; font-size: 30px; font-weight: 600; margin-top: 30px;">${changeDate(
    new Date()
  )} ${("0" + new Date().getHours()).slice(-2)}:${(
    "0" + new Date().getMinutes()
  ).slice(-2)}</p>
</view>
</body>

</html>
  `;

  const htmlEntry = `
<html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style type="text/css">
  * {
    padding: 0;
    margin: 0;
    box-sizing: 'border-box';
    font-family: sans-serif;
    color: #444444
  }

  @page { margin: 20px; } 
</style>
</head>

<body>
<view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
  <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
    INVENTARIO
  </h2>
  <p style="text-align: center; color: #444444; font-size: 30px; font-weight: 800; margin-bottom: 30px;">
    ${inventoryRef.name.toUpperCase()} - ENTRADA
  </p>
  <view style="width: 100%; margin: 20px auto;">
    <table style="width: 100%">
      <tr>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">CANTIDAD</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">$ ANTERIOR</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">$ ACTUAL</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600; display: inline-block;">VARIACIÓN</p>
          </td>
        </tr>
      ${textEntry.replace(/,/g, "")}
    </table>
    
  </view>
  <p style="text-align: center; font-size: 30px; font-weight: 600; margin-top: 30px;">${changeDate(
    new Date()
  )} ${("0" + new Date().getHours()).slice(-2)}:${(
    "0" + new Date().getMinutes()
  ).slice(-2)}</p>
</view>
</body>
</html>
`;

  const removeEntryOutput = () => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar todas las ${
        type === "entry" ? "entradas" : "salidas"
      }?`,
      `Se eliminaran toda la información de ${
        type === "entry" ? "entrada" : "salida"
      } en el elemento ${inventoryRef.name.toUpperCase()}`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const editable = {
              ...inventory.find((i) => i.id === inventoryRef.id),
            };
            editable[type] = [];
            dispatch(edit({ id: inventoryRef.id, data: editable }));
            navigation.pop();
            await editInventory({
              identifier: activeGroup.active
                ? activeGroup.identifier
                : user.identifier,
              inventory: editable,
              groups: activeGroup.active
                ? [activeGroup.id]
                : helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const EntryCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={() =>
          navigation.navigate("CreateEntryOutput", {
            type,
            editing: true,
            item,
          })
        }
      >
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(item.quantity)}
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(item.lastValue)}
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(item.currentValue)}
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle
            smallParagraph
            color={
              item.currentValue - item.lastValue > 0 ? "#F70000" : light.main2
            }
          >
            {item.currentValue - item.lastValue > 0 ? "+" : "-"}
            {thousandsSystem(Math.abs(item.currentValue - item.lastValue))}
          </TextStyle>
        </View>
      </TouchableOpacity>
    );
  };

  const EntryHeader = () => {
    return (
      <View style={{ flexDirection: "row" }}>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle color={light.main2} smallParagraph>
            CANTIDAD
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle color={light.main2} smallParagraph>
            $ ANTERIOR
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle color={light.main2} smallParagraph>
            $ ACTUAL
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 4.46,
            },
          ]}
        >
          <TextStyle color={light.main2} smallParagraph>
            VARIACIÓN
          </TextStyle>
        </View>
      </View>
    );
  };

  const OutputCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={() =>
          navigation.navigate("CreateEntryOutput", {
            type,
            editing: true,
            item,
          })
        }
      >
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 2.23,
            },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(item.quantity)}
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 2.23,
            },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(item.currentValue)}
          </TextStyle>
        </View>
      </TouchableOpacity>
    );
  };

  const OutputHeader = () => {
    return (
      <View style={{ flexDirection: "row" }}>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 2.23,
            },
          ]}
        >
          <TextStyle color={light.main2} smallParagraph>
            CANTIDAD
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width: SCREEN_WIDTH / 2.23,
            },
          ]}
        >
          <TextStyle color={light.main2} smallParagraph>
            PRECIO ACTUAL
          </TextStyle>
        </View>
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={[styles.row, { marginBottom: 20 }]}>
        <TextStyle
          subtitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {type === "entry" ? "Entrada" : "Salida"}
        </TextStyle>
        <View style={styles.events}>
          {data.length > 0 && (
            <TouchableOpacity onPress={() => removeEntryOutput()}>
              <Ionicons
                name="trash"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {data.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                print({
                  html: type === "entry" ? htmlEntry : htmlOutput,
                })
              }
            >
              <Ionicons
                name="print"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {data.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                generatePDF({
                  html: type === "entry" ? htmlEntry : htmlOutput,
                  code: "PDF VBELA",
                })
              }
            >
              <Ionicons
                name="document-attach"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {/*data.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )*/}
        </View>
      </View>
      <View>
        {data.length === 0 && (
          <TextStyle color={light.main2} center smallSubtitle>
            No hay {type === "entry" ? "entrada" : "salida"}
          </TextStyle>
        )}
        {data.length > 0 && (
          <View style={{ alignItems: "center" }}>
            {type === "entry" && <EntryHeader />}
            {type === "output" && <OutputHeader />}
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: SCREEN_HEIGHT / 1.55 }}
              showsVerticalScrollIndicator={false}
              renderItem={type === "entry" ? EntryCard : OutputCard}
            />
          </View>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  events: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  details: {
    justifyContent: "space-around",
    marginVertical: 5,
    padding: 5,
    borderColor: light.main2,
    borderRadius: 8,
    borderWidth: 1,
  },
  guestCard: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginVertical: 5,
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default EntryOutputInformation;
