import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Switch,
  Image
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  thousandsSystem,
  changeDate,
  generatePDF,
  print,
  getFontSize,
} from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import FullFilterDate from "@components/FullFilterDate";
import Layout from "@components/Layout";
import Logo from "@assets/logo.png";

import theme from "@theme";
import TextStyle from "@components/TextStyle";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("screen");

const Inventory = () => {
  const mode = useSelector((state) => state.mode);
  const inventoryInformation = useSelector((state) => state.inventory);

  const [inventory, setInventory] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [text, setText] = useState("");

  const initialState = {
    active: false,
    minQuantity: "",
    maxQuantity: "",
    minEntry: "",
    maxEntry: "",
    minOutput: "",
    maxOutput: "",
    minValue: "",
    maxValue: "",
    minReorden: "",
    maxReorden: "",
    unit: "",
    visible: "",
    aboveReorder: false,
    belowReorder: false,
    year: "all",
    month: "all",
    day: "all",
  };

  const [filters, setFilters] = useState(initialState);

  const navigation = useNavigation();
  const searchRef = useRef();
  const unitRef = useRef();
  const visibleRef = useRef();

  const unitOptions = [
    { label: "SELECCIONE LA UNIDAD", value: "" },
    { label: "Unidad", value: "UND" },
    { label: "Kilogramo", value: "KG" },
    { label: "Gramo", value: "G" },
    { label: "Miligramo", value: "MG" },
    { label: "Onza", value: "OZ" },
    { label: "Libra", value: "LB" },
    { label: "Litro", value: "L" },
    { label: "Mililitro", value: "ML" },
    { label: "Galón", value: "GAL" },
    { label: "Pinta", value: "PT" },
    { label: "Onza fluida", value: "FL OZ" },
  ];

  const visibleOptions = [
    { label: "SELECCIONE LA VISIBILIDAD", value: "" },
    { label: "Restaurante/Bar", value: "menu" },
    { label: "Productos&Servicios", value: "sales" },
    { label: "Ambos", value: "both" },
    { label: "Ninguno", value: 'none' },
  ];

  const dateValidation = (date) => {
    let error = false;
    if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
    if (filters.month !== "all" && date.getMonth() + 1 !== filters.month)
      error = true;
    if (filters.year !== "all" && date.getFullYear() !== filters.year)
      error = true;
    return error;
  };

  useEffect(() => {
    if (search || filters.active) {
      setInventory(
        [...inventoryInformation].reverse().filter((i) => {
          const removeSymbols = (text) =>
            text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const keyword = removeSymbols(search.toLocaleLowerCase());
          if (filters.active) {
            const item = removeSymbols(String(i.name).toLowerCase()).includes(
              keyword
            );

            if (!item) return;

            const stock =
              i.entry.reduce((a, b) => a + b.quantity, 0) -
              i.output.reduce((a, b) => a + b.quantity, 0);

            const getTotalEntry = () =>
              i.entry
                .filter((e) => e.entry)
                .reduce((a, b) => a + b.quantity, 0);
            const getTotalValue = () =>
              i.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
              i.output.reduce((a, b) => a + b.currentValue * b.quantity, 0);

            if (dateValidation(new Date(i.creationDate))) return;
            if (
              filters.minQuantity &&
              stock < parseInt(filters.minQuantity.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxQuantity &&
              stock > parseInt(filters.maxQuantity.replace(/\D/g, ""))
            )
              return;
            if (
              filters.minEntry &&
              getTotalEntry() < parseInt(filters.minEntry.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxEntry &&
              getTotalEntry() > parseInt(filters.maxEntry.replace(/\D/g, ""))
            )
              return;
            if (
              filters.minOutput &&
              i.output.reduce((a, b) => a + b.quantity, 0) <
                parseInt(filters.minOutput.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxOutput &&
              i.output.reduce((a, b) => a + b.quantity, 0) >
                parseInt(filters.maxOutput.replace(/\D/g, ""))
            )
              return;
            if (
              filters.minValue &&
              getTotalValue() < parseInt(filters.minValue.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxValue &&
              getTotalValue() > parseInt(filters.maxValue.replace(/\D/g, ""))
            )
              return;
            if (
              filters.minReorden &&
              i.reorder < parseInt(filters.minReorden.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxReorden &&
              i.reorder > parseInt(filters.maxReorden.replace(/\D/g, ""))
            )
              return;
            if (filters.unit && i.unit !== filters.unit) return;
            if (filters.visible && i.visible !== filters.visible) return;
            if (filters.aboveReorder && stock < i.reorder) return;
            if (filters.belowReorder && stock >= i.reorder) return;

            return item;
          } else
            return removeSymbols(String(i.name))
              .toLowerCase()
              .includes(keyword);
        })
      );
    } else setInventory([...inventoryInformation].reverse());
  }, [inventoryInformation, search, filters]);

  useEffect(() => setSearch(""), [activeSearch]);

  useEffect(() => {
    setText("");
    const text = inventory.reduce((a, item) => {
      const stock =
        item.entry.reduce((a, b) => a + b.quantity, 0) -
        item.output.reduce((a, b) => a + b.quantity, 0);

      const value =
        item.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
        item.output.reduce((a, b) => a + b.currentValue * b.quantity, 0);

      return (
        a +
        `<tr>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${item.name}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                item.entry
                  .filter((e) => e.entry)
                  .reduce((a, b) => a + b.quantity, 0)
              )}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                item.output.reduce((a, b) => a + b.quantity, 0)
              )}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600; color: ${
                stock < item.reorder ? "#F70000" : "#000000"
              }; display: inline-block;">${
          stock < 0 ? "-" : ""
        }${thousandsSystem(Math.abs(stock))}</p>
              <p style="font-size: 18px; font-weight: 600; display: inline-block;">
                /${thousandsSystem(item.reorder)}
              </p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${item.unit}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600; color: ${
                value < 0 ? "#F70000" : "#000000"
              }">
              ${value < 0 ? "-" : ""}${thousandsSystem(Math.abs(value))}</p>
            </td>
          </tr>`
      );
    }, "");
    setText(text);
  }, [inventory]);

  const totalValue = inventory.reduce(
    (a, item) =>
      a +
      item.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
      item.output.reduce((a, b) => a + b.currentValue * b.quantity, 0),
    0
  );

  const html = `
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
  <view>
    <img
      src="${Image.resolveAssetSource(Logo).uri}"
      style="width: 22vw; display: block; margin: 0 auto; border-radius: 8px" />
    <p style="font-size: 30px; text-align: center">vbelapp.com</p>
  </view>
  <p style="font-size: 30px; text-align: center; margin: 20px 0; background-color: #444444; padding: 10px 0; color: #FFFFFF">INVENTARIO</p>    

  <view style="width: 100%; margin: 20px auto;">
    <table style="width: 100%">
      <tr>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">NOMBRE</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">ENTRADA</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">SALIDA</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600; display: inline-block;">STOCK</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">UND</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 18px; font-weight: 600;">VALOR</p>
          </td>
        </tr>
      ${text.replace(/,/g, "")}
    </table>
        
    <p style="text-align: center; font-size: 30px; font-weight: 600; margin-top: 20px;">Valor total: ${thousandsSystem(
      totalValue
    )}</p>
    
  </view>
  <p style="text-align: center; font-size: 30px; font-weight: 600;">${changeDate(
    new Date()
  )} ${("0" + new Date().getHours()).slice(-2)}:${(
    "0" + new Date().getMinutes()
  ).slice(-2)}</p>
</view>
</body>

</html>
`;

  const Table = ({ item }) => {
    const stock =
      item.entry.reduce((a, b) => a + b.quantity, 0) -
      item.output.reduce((a, b) => a + b.quantity, 0);

    const value =
      item.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
      item.output.reduce((a, b) => a + b.currentValue * b.quantity, 0);

    return (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CreateElement", { editing: true, item })
          }
          style={[
            styles.table,
            { borderColor: mode === "light" ? light.textDark : dark.textWhite },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {item.name}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.table,
            { borderColor: mode === "light" ? light.textDark : dark.textWhite },
          ]}
          onPress={() =>
            navigation.navigate("EntryOutputInformation", {
              type: "entry",
              item,
            })
          }
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(
              item.entry
                .filter((e) => e.entry)
                .reduce((a, b) => a + b.quantity, 0)
            )}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.table,
            { borderColor: mode === "light" ? light.textDark : dark.textWhite },
          ]}
          onPress={() =>
            navigation.navigate("EntryOutputInformation", {
              type: "output",
              item,
            })
          }
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(item.output.reduce((a, b) => a + b.quantity, 0))}
          </TextStyle>
        </TouchableOpacity>
        <View
          style={[
            styles.table,
            { borderColor: mode === "light" ? light.textDark : dark.textWhite },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            <TextStyle
              smallParagraph
              color={
                stock < item.reorder
                  ? "#F70000"
                  : mode === "light"
                  ? light.textDark
                  : dark.textWhite
              }
            >
              {stock < 0 ? "-" : ""}
              {thousandsSystem(Math.abs(stock))}/
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              {thousandsSystem(item.reorder)}
            </TextStyle>
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            { borderColor: mode === "light" ? light.textDark : dark.textWhite },
          ]}
        >
          <TextStyle
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {item.unit}
          </TextStyle>
        </View>
        <View
          style={[
            styles.table,
            { borderColor: mode === "light" ? light.textDark : dark.textWhite },
          ]}
        >
          <TextStyle
            smallParagraph
            color={
              value < 0
                ? "#F70000"
                : mode === "light"
                ? light.textDark
                : dark.textWhite
            }
          >
            {value < 0 ? "-" : ""}
            {thousandsSystem(Math.abs(value))}
          </TextStyle>
        </View>
      </View>
    );
  };

  return (
    <Layout>
      <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
        <View style={styles.row}>
          <View style={{ flexDirection: "row" }}>
            {(inventory.length > 0 || activeSearch) && (
              <ButtonStyle
                onPress={() =>
                  navigation.navigate("CreateEntryOutput", { type: "entry" })
                }
                backgroundColor={light.main2}
                style={{
                  width: "auto",
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  marginHorizontal: 2,
                }}
              >
                <TextStyle center verySmall>
                  ENTRADA
                </TextStyle>
              </ButtonStyle>
            )}
            {(inventory.length > 0 || activeSearch) && (
              <ButtonStyle
                onPress={() =>
                  navigation.navigate("CreateEntryOutput", { type: "output" })
                }
                backgroundColor={light.main2}
                style={{
                  width: "auto",
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  marginHorizontal: 2,
                }}
              >
                <TextStyle center verySmall>
                  SALIDA
                </TextStyle>
              </ButtonStyle>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {(inventory.length > 0 || activeSearch) && (
              <TouchableOpacity
                onPress={() => navigation.navigate("InventoryInformation")}
              >
                <Ionicons
                  name="information-circle"
                  size={getFontSize(32)}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            {(inventory.length > 0 || activeSearch) && (
              <TouchableOpacity
                onPress={() => generatePDF({ html, code: "INVENTARIO VBELA" })}
              >
                <Ionicons
                  name="document"
                  size={getFontSize(32)}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            {(inventory.length > 0 || activeSearch) && (
              <TouchableOpacity onPress={() => print({ html })}>
                <Ionicons
                  name="print"
                  size={getFontSize(32)}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            {(inventory.length > 0 || activeSearch) && (
              <TouchableOpacity
                onPress={() => {
                  const state = !activeSearch;
                  setActiveSearch(state);
                  if (state) setTimeout(() => searchRef.current.focus());
                }}
              >
                <Ionicons
                  name="search"
                  size={getFontSize(32)}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            {(inventory.length > 0 || activeSearch) && (
              <TouchableOpacity
                onPress={() => navigation.navigate("CreateElement")}
                style={{ marginHorizontal: 2 }}
              >
                <Ionicons
                  name="add-circle"
                  size={getFontSize(32)}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {activeSearch && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setActiveSearch(false);
                setFilters(initialState);
              }}
            >
              <Ionicons
                name="close"
                size={30}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
            </TouchableOpacity>
            <InputStyle
              innerRef={searchRef}
              placeholder="Buscar producto"
              value={search}
              onChangeText={(text) => setSearch(text)}
              stylesContainer={{ width: "78%", marginVertical: 0 }}
              stylesInput={{
                paddingHorizontal: 6,
                paddingVertical: 5,
                fontSize: 18,
              }}
            />
            <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
              <Ionicons name="filter" size={30} color={light.main2} />
            </TouchableOpacity>
          </View>
        )}
        {inventory.length === 0 && activeSearch && (
          <TextStyle center color={light.main2} style={{ marginTop: 20 }}>
            NO HAY RESULTADOS
          </TextStyle>
        )}
        {inventory.length === 0 && !activeSearch && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ width: "auto", paddingHorizontal: 35 }}
              onPress={() => navigation.navigate("CreateElement")}
            >
              <TextStyle center color={light.textDark}>
                Crear tabla de elementos
              </TextStyle>
            </ButtonStyle>
          </View>
        )}
        <View
          style={{ alignItems: "center", marginTop: 20, height: SCREEN_HEIGHT / 1.3 }}
        >
          {inventory.length > 0 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        PRODUCTO
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        ENTRADA
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        SALIDA
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        STOCK
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        UNIDAD
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        VALOR
                      </TextStyle>
                    </View>
                  </View>
                  <FlatList
                    data={inventory}
                    renderItem={Table}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              </ScrollView>
            </ScrollView>
          )}
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeFilter}
        onRequestClose={() => {
          setActiveFilter(!activeFilter);
          setFilters(initialState);
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: mode === "light" ? light.main4 : dark.main1,
              padding: 30,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              <View style={styles.row}>
                <TextStyle bigSubtitle color={light.main2} bold>
                  FILTRA
                </TextStyle>
                <TouchableOpacity
                  onPress={() => {
                    setActiveFilter(false);
                    setFilters(initialState);
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Para una búsqueda más precisa
              </TextStyle>
            </View>
            <View style={{ marginTop: 6 }}>
              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Cantidad MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minQuantity}
                    onChangeText={(text) => {
                      const quantity = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minQuantity: quantity });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Cantida MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxQuantity}
                    onChangeText={(text) => {
                      const quantity = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxQuantity: quantity });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Entrada MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minEntry}
                    onChangeText={(text) => {
                      const entry = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minEntry: entry });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Entrada MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxEntry}
                    onChangeText={(text) => {
                      const entry = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxEntry: entry });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Salida MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minOutput}
                    onChangeText={(text) => {
                      const output = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minOutput: output });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Salida MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxOutput}
                    onChangeText={(text) => {
                      const output = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxOutput: output });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minValue: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxValue: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Punto de reorden MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minReorder}
                    onChangeText={(text) => {
                      const reorder = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minReorder: reorder });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Punto de reorden MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxReorden}
                    onChangeText={(text) => {
                      const reorder = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxReorden: reorder });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
              <FullFilterDate
                title="Por fecha (CREACIÓN)"
                increment={5}
                monthButtonStyle={{ width: SCREEN_WIDTH / 2.8 }}
                defaultValue={{
                  day: filters.day,
                  month: filters.month,
                  year: filters.year,
                }}
                onChangeDay={(value) => setFilters({ ...filters, day: value })}
                onChangeMonth={(value) =>
                  setFilters({ ...filters, month: value })
                }
                onChangeYear={(value) =>
                  setFilters({ ...filters, year: value })
                }
              />
              <View style={{ marginTop: 15 }}>
                <ButtonStyle
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => unitRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle
                      color={
                        filters.unit
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                    >
                      {unitOptions.find((u) => u.value === filters.unit)?.label}
                    </TextStyle>
                    <Ionicons
                      color={
                        filters.unit
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                      size={getFontSize(15)}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>

                <View style={{ display: "none" }}>
                  <Picker
                    ref={unitRef}
                    style={{ opacity: 0 }}
                    selectedValue={filters.unit}
                    onValueChange={(value) =>
                      setFilters({ ...filters, unit: value })
                    }
                  >
                    {unitOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ marginTop: 15 }}>
                <ButtonStyle
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => visibleRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle
                      color={
                        filters.visible
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                    >
                      {visibleOptions.find((u) => u.value === filters.visible)?.label}
                    </TextStyle>
                    <Ionicons
                      color={
                        filters.visible
                          ? mode === "light"
                            ? light.textDark
                            : dark.textWhite
                          : "#888888"
                      }
                      size={getFontSize(15)}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>

                <View style={{ display: "none" }}>
                  <Picker
                    ref={visibleRef}
                    style={{ opacity: 0 }}
                    selectedValue={filters.visible}
                    onValueChange={(value) =>
                      setFilters({ ...filters, visible: value })
                    }
                  >
                    {visibleOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <TextStyle verySmall color={light.main2}>
                  Solo los que esten encima del punto de reorden
                </TextStyle>
                <Switch
                  trackColor={{ false: dark.main2, true: light.main2 }}
                  thumbColor={light.main4}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      aboveReorder: value,
                      belowReorder: false,
                    })
                  }
                  value={filters.aboveReorder}
                />
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <TextStyle verySmall color={light.main2}>
                  Solo los que esten por debajo del punto de reorden
                </TextStyle>
                <Switch
                  trackColor={{ false: dark.main2, true: light.main2 }}
                  thumbColor={light.main4}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      belowReorder: value,
                      aboveReorder: false,
                    })
                  }
                  value={filters.belowReorder}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              {filters.active && (
                <ButtonStyle
                  style={{ width: "30%" }}
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => {
                    setActiveFilter(false);
                    setFilters(initialState);
                  }}
                >
                  <TextStyle
                    center
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Remover
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                onPress={() => {
                  setActiveFilter(!activeFilter);
                  const compare = { ...filters, active: false };

                  if (
                    JSON.stringify(compare) === JSON.stringify(initialState)
                  ) {
                    setFilters(initialState);
                    return;
                  }
                  setFilters({ ...filters, active: true });
                }}
                backgroundColor={light.main2}
                style={{
                  width: filters.active ? "65%" : "99%",
                }}
              >
                <TextStyle center>Buscar</TextStyle>
              </ButtonStyle>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    marginHorizontal: 10,
  },
  table: {
    width: 100,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
  card: {
    padding: 6,
    width: Math.floor(SCREEN_WIDTH / 3.25),
    marginHorizontal: 5,
    height: Math.floor(SCREEN_HEIGHT / 13),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Inventory;
