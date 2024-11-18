import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Switch,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { thousandsSystem, changeDate, generatePDF, print } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import Information from "@components/Information";
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

const Stock = () => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const inventoryInformation = useSelector((state) => state.inventory);

  const [inventory, setInventory] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [activeAvanceFilter, setActiveAvanceFilter] = useState(false);
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
    brand: "",
    reference: "",
    year: "all",
    month: "all",
    day: "all",
  };

  const [filters, setFilters] = useState(initialState);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

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
    { label: "Ninguno", value: "none" },
  ];

  const dateValidation = (date) => {
    let error = false;
    if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
    if (filters.month !== "all" && date.getMonth() + 1 !== filters.month) error = true;
    if (filters.year !== "all" && date.getFullYear() !== filters.year) error = true;
    return error;
  };

  useEffect(() => {
    if (search || filters.active) {
      setInventory(
        [...inventoryInformation].reverse().filter((i) => {
          const removeSymbols = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const keyword = removeSymbols(search.toLocaleLowerCase());

          const condition = (text) => removeSymbols(String(text)).toLowerCase().includes(keyword);

          if (filters.active) {
            const item = condition(i.name) || condition(i.brand) || condition(i.reference);
            if (!item) return;

            const stock =
              i.entry.reduce((a, b) => a + b.quantity, 0) - i.output.reduce((a, b) => a + b.quantity, 0);

            const getTotalEntry = () =>
              i.entry.filter((e) => e.entry).reduce((a, b) => a + b.quantity, 0);
            const getTotalValue = () =>
              i.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
              i.output.reduce((a, b) => a + b.currentValue * b.quantity, 0);

            if (dateValidation(new Date(i.creationDate))) return;
            if (filters.brand && filters.brand !== i.brand) return;
            if (filters.reference && filters.reference !== i.reference) return;
            if (filters.minQuantity && stock < parseInt(filters.minQuantity.replace(/\D/g, ""))) return;
            if (filters.maxQuantity && stock > parseInt(filters.maxQuantity.replace(/\D/g, ""))) return;
            if (filters.minEntry && getTotalEntry() < parseInt(filters.minEntry.replace(/\D/g, "")))
              return;
            if (filters.maxEntry && getTotalEntry() > parseInt(filters.maxEntry.replace(/\D/g, "")))
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
            if (filters.minValue && getTotalValue() < parseInt(filters.minValue.replace(/\D/g, "")))
              return;
            if (filters.maxValue && getTotalValue() > parseInt(filters.maxValue.replace(/\D/g, "")))
              return;
            if (filters.minReorden && i.reorder < parseInt(filters.minReorden.replace(/\D/g, "")))
              return;
            if (filters.maxReorden && i.reorder > parseInt(filters.maxReorden.replace(/\D/g, "")))
              return;
            if (filters.unit && i.unit !== filters.unit) return;
            if (filters.visible && i.visible !== filters.visible) return;
            if (filters.aboveReorder && stock < i.reorder) return;
            if (filters.belowReorder && stock >= i.reorder) return;

            return item;
          } else return condition(i.name) || condition(i.brand) || condition(i.reference);
        })
      );
    } else setInventory([...inventoryInformation].reverse());
  }, [inventoryInformation, search, filters]);

  useEffect(() => setSearch(""), [activeSearch]);

  useEffect(() => {
    setText("");
    const text = inventory.reduce((a, item) => {
      const stock =
        item.entry.reduce((a, b) => a + b.quantity, 0) - item.output.reduce((a, b) => a + b.quantity, 0);

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
                item.entry.filter((e) => e.entry).reduce((a, b) => a + b.quantity, 0)
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
              }; display: inline-block;">${thousandsSystem(stock || "0")}</p>
              <p style="font-size: 18px; font-weight: 600; display: inline-block;">
                /${thousandsSystem(item.reorder)}
              </p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${item.unit}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600; color: ${value < 0 ? "#F70000" : "#000000"}">
              ${thousandsSystem(value || "0")}</p>
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

  const totalQuantity = inventory.reduce(
    (a, item) =>
      a +
      item.entry.reduce((a, b) => a + b.quantity, 0) -
      item.output.reduce((a, b) => a + b.quantity, 0),
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
    color: #000000
  }

  @page { margin: 20px; } 
</style>
</head>

<body>
  <table style="padding: 20px 0 0 0; margin: 20px 0; width: 100vw;">
    <tr>
      <td style="text-align: left;">
        <p style="font-size: 40px; font-weight: 600;">REPORTE DE INVENTARIO</p>
        <p style="font-size: 40px; font-weight: 600;">VBELA</p>
      </td>
      <td style="text-align: right;">
        <img
          src="${Image.resolveAssetSource(Logo).uri}"
          style="width: 100px; border-radius: 8px" />
      </td>
    </tr>
  </table>
  <view>
  <table style="width: 100vw;">
    <tr>
      <td style="text-align: left;">
        <p style="font-size: 24px; font-weight: 600;">Número de productos: ${thousandsSystem(
          inventory.length
        )}</p>
      </td>
      <td style="text-align: right;">
        <p style="font-size: 24px; font-weight: 600;">${user.identifier}</p>
      </td>
    </tr>
  </table>

    <p style="font-size: 24px; font-weight: 600;">Fecha de generación: ${changeDate(new Date(), {
      time: true,
    })}</p>
    
    <table style="width: 100vw; margin-top: 25px;">
      <tr>
        <td style="padding: 15px 0; border: 1px solid "#000000"; border-radius: 8px">
          <view style="text-align: center;">
            <p style="font-size: 24px; font-weight: 600;">Valor total del inventario</p>
            <p style="font-size: 24px; font-weight: 800; color: ${
              totalValue < 0 ? "#F70000" : "#000000"
            }">${thousandsSystem(totalValue)}</p>
          </view>
        </td>
        <td style="padding: 15px 0; border: 1px solid "#000000"; border-radius: 8px">
          <view style="text-align: center;">
            <p style="font-size: 24px; font-weight: 600;">Cantidad total del inventario</p>
            <p style="font-size: 24px; font-weight: 800; color: ${
              totalQuantity < 0 ? "#F70000" : "#000000"
            }">${thousandsSystem(totalQuantity)}</p>
          </view>
        </td>
      </tr>
    </table>

    <view style="display: block; margin: 25px 0">
      <p style="font-size: 24px; font-weight: 600; margin-bottom: 10px">Resumen de inventario</p>
      <table style="width: 100vw">
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
    </view>
    <p style="font-size: 24px; font-weight: 600;">No se le olvide visitar vbelapp.com</p>
  </view>
</body>

</html>
`;

  const Table = ({ item }) => {
    const stock =
      item.entry.reduce((a, b) => a + b.quantity, 0) - item.output.reduce((a, b) => a + b.quantity, 0);

    const value =
      item.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
      item.output.reduce((a, b) => a + b.currentValue * b.quantity, 0);

    return (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateElement", { editing: true, item })}
          style={[styles.table, { borderColor: textColor }]}
        >
          <TextStyle smallParagraph color={textColor}>
            {item.name}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.table, { borderColor: textColor }]}
          onPress={() =>
            navigation.navigate("EntryOutputInformation", {
              type: "entry",
              item,
            })
          }
        >
          <TextStyle smallParagraph color={textColor}>
            {thousandsSystem(item.entry.filter((e) => e.entry).reduce((a, b) => a + b.quantity, 0))}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.table, { borderColor: textColor }]}
          onPress={() =>
            navigation.navigate("EntryOutputInformation", {
              type: "output",
              item,
            })
          }
        >
          <TextStyle smallParagraph color={textColor}>
            {thousandsSystem(item.output.reduce((a, b) => a + b.quantity, 0))}
          </TextStyle>
        </TouchableOpacity>
        <View
          style={[styles.table, { borderColor: textColor, flexDirection: "row", alignItems: "center" }]}
        >
          <TextStyle verySmall color={stock < item.reorder ? "#F70000" : textColor}>
            {thousandsSystem(stock)}/
          </TextStyle>
          <TextStyle verySmall color={light.main2}>
            {thousandsSystem(item.reorder)}
          </TextStyle>
        </View>
        <View style={[styles.table, { borderColor: textColor }]}>
          <TextStyle smallParagraph color={textColor}>
            {item.unit}
          </TextStyle>
        </View>
        <View style={[styles.table, { borderColor: textColor }]}>
          <TextStyle smallParagraph color={value < 0 ? "#F70000" : textColor}>
            {thousandsSystem(value)}
          </TextStyle>
        </View>
      </View>
    );
  };

  return (
    <Layout>
      <View style={styles.row}>
        {(inventory.length > 0 || activeSearch) && (
          <View>
            <TextStyle color={textColor} bigParagraph>
              PRODUCTOS
            </TextStyle>
            <TextStyle color={light.main2} smallParagraph>
              INVENTARIO
            </TextStyle>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {(inventory.length > 0 || activeSearch) && (
            <TouchableOpacity onPress={() => navigation.navigate("InventoryInformation")}>
              <Ionicons name="information-circle" size={34} color={light.main2} />
            </TouchableOpacity>
          )}
          {(inventory.length > 0 || activeSearch) && (
            <TouchableOpacity
              onPress={() => generatePDF({ html, code: "INVENTARIO VBELA", width: 657, height: 850 })}
            >
              <Ionicons name="document" size={34} color={light.main2} />
            </TouchableOpacity>
          )}
          {(inventory.length > 0 || activeSearch) && (
            <TouchableOpacity onPress={() => print({ html, width: 657, height: 850 })}>
              <Ionicons name="print" size={34} color={light.main2} />
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
              <Ionicons name="search" size={34} color={light.main2} />
            </TouchableOpacity>
          )}
          {(inventory.length > 0 || activeSearch) && (
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateElement")}
              style={{ marginHorizontal: 2 }}
            >
              <Ionicons name="add-circle" size={34} color={light.main2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {inventory.length > 0 && (
        <TextStyle color={textColor} smallParagraph>
          VALOR TOTAL:{" "}
          {(() => {
            const total = inventory.reduce((a, b) => {
              const value =
                b.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
                b.output.reduce((a, b) => a + b.currentValue * b.quantity, 0);
              return a + value;
            }, 0);

            return (
              <TextStyle color={total < 0 ? "#F70000" : light.main2} smallParagraph>
                {thousandsSystem(total || "0")}
              </TextStyle>
            );
          })()}
        </TextStyle>
      )}
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
            <Ionicons name="close" size={30} color={textColor} />
          </TouchableOpacity>
          <InputStyle
            innerRef={searchRef}
            placeholder="Buscar producto"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "78%", marginVertical: 0 }}
            stylesInput={styles.search}
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
      <View
        style={{
          marginTop: 20,
          maxHeight: SCREEN_HEIGHT / 2.7,
        }}
      >
        {inventory.length > 0 && (
          <>
            <View style={[styles.row, { marginBottom: 5 }]}>
              <TextStyle color={textColor} smallParagraph>
                ELEMENTOS
              </TextStyle>
              <View style={{ flexDirection: "row" }}>
                <ButtonStyle
                  onPress={() =>
                    navigation.navigate("CreateEntryOutput", {
                      type: "entry",
                    })
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
                <ButtonStyle
                  onPress={() =>
                    navigation.navigate("CreateEntryOutput", {
                      type: "output",
                    })
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
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor: textColor,
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
                          borderColor: textColor,
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
                          borderColor: textColor,
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
                          borderColor: textColor,
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
                          borderColor: textColor,
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
                          borderColor: textColor,
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
                    initialNumToRender={5}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              </ScrollView>
            </ScrollView>
          </>
        )}
      </View>
      {inventory.length === 0 && !activeSearch && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              justifyContent: "center",
              alignItems: "center",
            },
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
      <Information
        modalVisible={activeFilter}
        setModalVisible={setActiveFilter}
        headerRight={() => (
          <TouchableOpacity
            onPress={() => {
              setActiveAvanceFilter(!activeAvanceFilter);
              setActiveFilter(!activeFilter);
            }}
          >
            <Ionicons name="filter" size={30} color={light.main2} />
          </TouchableOpacity>
        )}
        style={{ width: "90%", backgroundColor: mode === "light" ? light.main4 : dark.main1 }}
        title="FILTRO"
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Para una búsqueda más precisa
            </TextStyle>
            <View style={{ marginTop: 10 }}>
              <View style={{ marginTop: 5 }}>
                <TextStyle smallParagraph color={textColor}>
                  Marca
                </TextStyle>
                <InputStyle
                  value={filters.brand}
                  onChangeText={(text) => setFilters({ ...filters, brand: text })}
                  placeholder="Marca"
                  maxLength={20}
                />
              </View>
              <View style={{ marginTop: 5 }}>
                <TextStyle smallParagraph color={textColor}>
                  Referencia
                </TextStyle>
                <InputStyle
                  value={filters.reference}
                  onChangeText={(text) => setFilters({ ...filters, reference: text })}
                  placeholder="Referencias"
                  maxLength={20}
                />
              </View>
              <View style={{ marginTop: 5 }}>
                <ButtonStyle
                  backgroundColor={backgroundColor}
                  onPress={() => visibleRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle color={filters.visible ? textColor : "#888888"}>
                      {visibleOptions.find((u) => u.value === filters.visible)?.label}
                    </TextStyle>
                    <Ionicons
                      color={filters.visible ? textColor : "#888888"}
                      size={20}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>
                <View style={{ display: "none" }}>
                  <Picker
                    ref={visibleRef}
                    style={{ opacity: 0 }}
                    selectedValue={filters.visible}
                    onValueChange={(value) => setFilters({ ...filters, visible: value })}
                  >
                    {visibleOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
                        style={{
                          backgroundColor: backgroundColor,
                        }}
                        color={textColor}
                      />
                    ))}
                  </Picker>
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
                    backgroundColor={backgroundColor}
                    onPress={() => {
                      setActiveAvanceFilter(false);
                      setFilters(initialState);
                    }}
                  >
                    <TextStyle center color={textColor}>
                      Remover
                    </TextStyle>
                  </ButtonStyle>
                )}
                <ButtonStyle
                  onPress={() => {
                    setActiveAvanceFilter(!activeAvanceFilter);
                    const compare = { ...filters, active: false };

                    if (JSON.stringify(compare) === JSON.stringify(initialState)) {
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
            </View>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeAvanceFilter}
        onRequestClose={() => {
          setActiveAvanceFilter(!activeAvanceFilter);
          setFilters(initialState);
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: mode === "light" ? light.main4 : dark.main1, padding: 30 },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              <View style={styles.row}>
                <TextStyle bigSubtitle color={light.main2} bold>
                  FILTRO AVANZADO
                </TextStyle>
                <TouchableOpacity
                  onPress={() => {
                    setActiveAvanceFilter(false);
                    setFilters(initialState);
                  }}
                >
                  <Ionicons name="close" size={30} color={textColor} />
                </TouchableOpacity>
              </View>
              <TextStyle smallParagraph color={textColor}>
                Para una búsqueda más precisa
              </TextStyle>
            </View>
            <View style={{ marginTop: 6 }}>
              <View style={{ marginTop: 5 }}>
                <TextStyle smallParagraph color={textColor}>
                  Marca
                </TextStyle>
                <InputStyle
                  value={filters.brand}
                  onChangeText={(text) => setFilters({ ...filters, brand: text })}
                  placeholder="Marca"
                  maxLength={20}
                />
              </View>
              <View style={{ marginTop: 5 }}>
                <TextStyle smallParagraph color={textColor}>
                  Referencia
                </TextStyle>
                <InputStyle
                  value={filters.reference}
                  onChangeText={(text) => setFilters({ ...filters, reference: text })}
                  placeholder="Referencias"
                  maxLength={20}
                />
              </View>
              <View style={[styles.row, { marginTop: 5 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Cantidad MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minQuantity}
                    onChangeText={(text) => {
                      const quantity = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minQuantity: quantity });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Cantida MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxQuantity}
                    onChangeText={(text) => {
                      const quantity = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxQuantity: quantity });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 5 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Entrada MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minEntry}
                    onChangeText={(text) => {
                      const entry = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minEntry: entry });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Entrada MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxEntry}
                    onChangeText={(text) => {
                      const entry = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxEntry: entry });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
              <View style={[styles.row, { marginTop: 5 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Salida MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minOutput}
                    onChangeText={(text) => {
                      const output = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minOutput: output });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Salida MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxOutput}
                    onChangeText={(text) => {
                      const output = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxOutput: output });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 5 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Valor MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minValue: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Valor MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxValue: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 5 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Punto de reorden MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minReorder}
                    onChangeText={(text) => {
                      const reorder = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minReorder: reorder });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle smallParagraph color={textColor}>
                    Punto de reorden MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxReorden}
                    onChangeText={(text) => {
                      const reorder = thousandsSystem(text.replace(/[^0-9]/g, ""));
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
                onChangeMonth={(value) => setFilters({ ...filters, month: value })}
                onChangeYear={(value) => setFilters({ ...filters, year: value })}
              />
              <View style={{ marginTop: 5 }}>
                <ButtonStyle backgroundColor={backgroundColor} onPress={() => unitRef.current?.focus()}>
                  <View style={styles.row}>
                    <TextStyle color={filters.unit ? textColor : "#888888"}>
                      {unitOptions.find((u) => u.value === filters.unit)?.label}
                    </TextStyle>
                    <Ionicons color={filters.unit ? textColor : "#888888"} size={20} name="caret-down" />
                  </View>
                </ButtonStyle>

                <View style={{ display: "none" }}>
                  <Picker
                    ref={unitRef}
                    style={{ opacity: 0 }}
                    selectedValue={filters.unit}
                    onValueChange={(value) => setFilters({ ...filters, unit: value })}
                  >
                    {unitOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
                        style={{
                          backgroundColor: backgroundColor,
                        }}
                        color={textColor}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ marginTop: 5 }}>
                <ButtonStyle
                  backgroundColor={backgroundColor}
                  onPress={() => visibleRef.current?.focus()}
                >
                  <View style={styles.row}>
                    <TextStyle color={filters.visible ? textColor : "#888888"}>
                      {visibleOptions.find((u) => u.value === filters.visible)?.label}
                    </TextStyle>
                    <Ionicons
                      color={filters.visible ? textColor : "#888888"}
                      size={20}
                      name="caret-down"
                    />
                  </View>
                </ButtonStyle>

                <View style={{ display: "none" }}>
                  <Picker
                    ref={visibleRef}
                    style={{ opacity: 0 }}
                    selectedValue={filters.visible}
                    onValueChange={(value) => setFilters({ ...filters, visible: value })}
                  >
                    {visibleOptions.map((u) => (
                      <Picker.Item
                        key={u.value}
                        label={u.label}
                        value={u.value}
                        style={{
                          backgroundColor: backgroundColor,
                        }}
                        color={textColor}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 5 }]}>
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

              <View style={[styles.row, { marginTop: 5 }]}>
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
                  backgroundColor={backgroundColor}
                  onPress={() => {
                    setActiveAvanceFilter(false);
                    setFilters(initialState);
                  }}
                >
                  <TextStyle center color={textColor}>
                    Remover
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                onPress={() => {
                  setActiveAvanceFilter(!activeAvanceFilter);
                  const compare = { ...filters, active: false };

                  if (JSON.stringify(compare) === JSON.stringify(initialState)) {
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
  search: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
});

export default Stock;
