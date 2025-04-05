import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import { useTheme } from "@react-navigation/native";
import { generateExcel, generatePDF, printPDF } from "infrastructure/services";
import moment from "moment";
import { Order, Economy } from "domain/entities/data";
import { changeDate, thousandsSystem } from "shared/utils";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStatistics, StatisticsRouteProp } from "domain/entities/navigation";
import { DateType, startEndTextHandler } from "presentation/components/layout/FullFilterDate";

type Icons = keyof typeof Ionicons.glyphMap;

type ButtonProps = { icon: Icons; name: string; onPress: () => void };

const Button: React.FC<ButtonProps> = ({ icon, name, onPress }) => {
  const { colors } = useTheme();

  return (
    <StyledButton style={[styles.button, { borderColor: colors.border }]} onPress={onPress}>
      <Ionicons name={icon} size={30} color={colors.text} />
      <StyledText verySmall style={{ marginTop: 10 }}>
        {name}
      </StyledText>
    </StyledButton>
  );
};

type CardProps = {
  title: string;
  subtitle?: string;
  value: number | string;
};

const Card: React.FC<CardProps> = ({ title, subtitle, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View>
        <StyledText>{title}</StyledText>
        {subtitle && <StyledText verySmall>{subtitle}</StyledText>}
      </View>
      <StyledText color={Number(value) >= 0 ? colors.primary : "#f71010"}>
        {thousandsSystem(value)}
      </StyledText>
    </View>
  );
};

type ReportSelection = {
  id: string;
  name: string;
  quantity: number;
  value: number;
};

const calculateQuantity = (orders: Order[]): ReportSelection[] => {
  const selection = orders.flatMap((o) => o.selection);
  const calculated = selection.reduce<ReportSelection[]>((acc, b) => {
    const found = acc.find((a) => a.id === b.id);
    if (found) {
      found.value += b.total;
      found.quantity += b.quantity;
    } else {
      acc.push({
        id: b.id,
        name: b.name,
        value: b.total,
        quantity: b.quantity,
      });
    }
    return acc;
  }, []);
  return calculated.sort((a, b) => b.quantity - a.quantity);
};

const dataConverter = (quantities: ReportSelection[], Pertenece: "Restaurante" | "Tienda") =>
  quantities.map((q) => ({
    Nombre: q.name,
    Cantidad: q.quantity,
    Valor: q.value,
    Pertenece,
  }));

const generateReportHTML = (
  OQuantity: ReportSelection[],
  SQuantity: ReportSelection[],
  economies: Economy[],
  quantity: number,
  total: number,
  startEndText: string,
  orders: Order[],
  sales: Order[],
  date: DateType,
) => {
  const hasRestaurant = OQuantity.length > 0;
  const hasStore = SQuantity.length > 0;
  const hasEconomies = economies.length > 0;

  return `
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
          
          .space {
            padding: 20px 0;
            border-bottom: 1px solid #AAAAAA;
          }

          .row {
            display: flex;
            justify-content: space-between;
          }

          .title { text-align: center; }

          .text {
            font-size: 22px;
            font-weight: bold;
          }

          @page { margin: 50px; } 
        </style>
      </head>
      <body>
        <div>
          <p class="title text">INFORME DE VENTAS</p>
        </div>
        <div style="margin-top: 10px;">
          <div class="space">
            <div class="row">
              <span class="text">FECHA DE IMPRESIÓN</span>
              <span class="text">${changeDate(new Date(), true)}</span>
            </div>
          </div>
          <div class="space">
            <div class="row">
              <span class="text">Fecha:</span>
              <span class="text">${startEndText}</span>
            </div>
            <div class="row">
              <span class="text">Venta en la fecha:</span>
              <span class="text">${thousandsSystem([...orders, ...sales].length)}</span>
            </div>
            <div class="row">
              <span class="text">Apertura de caja:</span>
              <span class="text">${changeDate(new Date(date.start!), true)}</span>
            </div>
            <div class="row">
              <span class="text">Cierre de caja:</span>
              <span class="text">${changeDate(new Date(date.end!), true)}</span>
            </div>
            <div class="row">
              <span class="text">Valor en caja:</span>
              <span class="text">${thousandsSystem(total)}</span>
            </div>
          </div>
          ${
            hasRestaurant
              ? `
            <div class="space">
              <p class="text">RESTAURANTE/BAR</p>
            </div>
            <div class="space">
              ${OQuantity.map(
                (order) => `
                <div class="row">
                  <span class="text">${`${order.quantity}x ${order.name}`}</span>
                  <span class="text">${thousandsSystem(order.value)}</span>
                </div>
              `,
              ).join("")}
            </div>
          `
              : ""
          }
          ${
            hasStore
              ? `
            <div class="space">
              <p class="text">TIENDA</p>
            </div>
            <div class="space">
              ${SQuantity.map(
                (sale) => `
                <div class="row">
                  <span class="text">${`${sale.quantity}x ${sale.name}`}</span>
                  <span class="text">${thousandsSystem(sale.value)}</span>
                </div>
              `,
              ).join("")}
            </div>
          `
              : ""
          }
          
          ${
            hasEconomies
              ? `
            <div class="space">
              <p class="text">INGRESOS/EGRESOS</p>
            </div>
            <div class="space">
              ${economies
                .map(
                  (economy) => `
                <div class="row">
                  <span class="text">${economy.type}</span>
                  <span class="text">${thousandsSystem(economy.value)}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
          <div style="margin-top: 20px">
            <div class="row">
              <span class="text">CANTIDAD:</span>
              <span class="text">${thousandsSystem(quantity)}</span>
            </div>
            <div class="row">
              <span class="text">VALOR TOTAL:</span>
              <span class="text">${thousandsSystem(total)}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

type ReportProps = {
  navigation: StackNavigationProp<RootStatistics>;
  route: StatisticsRouteProp<"Report">;
};

const Report: React.FC<ReportProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const { date, orders, sales, economies } = route.params;
  const [details, setDetails] = useState<boolean>(false);

  const OQuantity = useMemo(() => calculateQuantity(orders), [orders]);
  const SQuantity = useMemo(() => calculateQuantity(sales), [sales]);

  const startEndText = useMemo(() => startEndTextHandler(date), [date]);

  const quantity = useMemo(
    () =>
      [...OQuantity, ...SQuantity].reduce((a, b) => a + b.quantity, 0) +
      economies.reduce((a, b) => a + b.quantity, 0),
    [OQuantity, SQuantity, economies],
  );

  const total = useMemo(
    () =>
      [...orders, ...sales].reduce((a, b) => a + b.total, 0) +
      economies.reduce((a, b) => a + b.value, 0),
    [orders, sales, economies],
  );

  const groupTotal = useMemo(
    () => sales.length + orders.length + economies.length,
    [sales, orders, economies],
  );

  const excelData = [
    ["Fecha", startEndText],
    ["Venta en la fecha", thousandsSystem([...orders, ...sales].length)],
    ["Apertura de caja", changeDate(new Date(date.start!), true)],
    ["Cierre de caja", changeDate(new Date(date.end!), true)],
    ["Valor en caja", thousandsSystem(total)],
    [], // Espacio en blanco para separar
    ...dataConverter(OQuantity, "Restaurante"),
    ...dataConverter(SQuantity, "Tienda"),
    ...economies.map((economy) => ({
      Nombre: economy.type,
      Cantidad: economy.quantity,
      Valor: economy.value,
      Pertenece: "Ingreso/Egreso",
    })),
  ];

  const html = generateReportHTML(
    OQuantity,
    SQuantity,
    economies,
    quantity,
    total,
    startEndText,
    orders,
    sales,
    date,
  );

  const renderOrderItem = ({ item }: { item: ReportSelection }) => (
    <Card title={`${item.quantity}x ${item.name}`} value={item.value} />
  );

  const renderEconomyItem = ({ item }: { item: Economy }) => (
    <Card title={item.type} value={item.value} />
  );

  return (
    <>
      <Layout>
        <View style={{ flex: 1 }}>
          {!groupTotal && <StyledText color={colors.primary}>NO HAY DATOS ENCONTRADOS</StyledText>}
          {!!groupTotal && (
            <>
              <View style={{ marginBottom: 15 }}>
                <StyledText>
                  Fecha: <StyledText color={colors.primary}>{startEndText}</StyledText>
                </StyledText>
                <StyledText>
                  Venta en la fecha:{" "}
                  <StyledText color={colors.primary}>
                    {thousandsSystem([...orders, ...sales].length)}
                  </StyledText>
                </StyledText>
                <StyledText>
                  Apertura de caja:{" "}
                  <StyledText color={colors.primary}>
                    {changeDate(new Date(date.start!), true)}
                  </StyledText>
                </StyledText>
                <StyledText>
                  Cierre de caja:{" "}
                  <StyledText color={colors.primary}>
                    {changeDate(new Date(date.end!), true)}
                  </StyledText>
                </StyledText>
                <StyledText>
                  Valor en caja:{" "}
                  <StyledText color={total >= 0 ? colors.primary : "#f71010"}>
                    {thousandsSystem(total)}
                  </StyledText>
                </StyledText>
              </View>
              <StyledButton backgroundColor={colors.primary} onPress={() => setDetails(!details)}>
                <StyledText center color="#FFFFFF">
                  {details ? "Ocultar" : "Mostrar"} detalles
                </StyledText>
              </StyledButton>
            </>
          )}
          {details && (
            <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="pricetag-outline" color={colors.primary} size={25} />
                  <StyledText style={{ marginLeft: 6 }}>RESTAURANTE/BAR</StyledText>
                </View>
                {!OQuantity.length && (
                  <StyledText verySmall color={colors.primary}>
                    NO SE ENCONTRARON ORDENES
                  </StyledText>
                )}
                <View style={{ marginVertical: 10 }}>
                  <FlatList
                    data={OQuantity}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    scrollEnabled={false}
                  />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="storefront-outline" color={colors.primary} size={25} />
                  <StyledText style={{ marginLeft: 6 }}>TIENDA</StyledText>
                </View>
                {!SQuantity.length && (
                  <StyledText verySmall color={colors.primary}>
                    NO SE ENCONTRARON VENTAS
                  </StyledText>
                )}
                <View style={{ marginVertical: 10 }}>
                  <FlatList
                    data={SQuantity}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    scrollEnabled={false}
                  />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="cash-outline" color={colors.primary} size={25} />
                  <StyledText style={{ marginLeft: 6 }}>INGRESOS/EGRESOS</StyledText>
                </View>
                {!economies.length && (
                  <StyledText verySmall color={colors.primary}>
                    NO SE ENCONTRARON INGRESOS/EGRESOS
                  </StyledText>
                )}
                <View style={{ marginVertical: 10 }}>
                  <FlatList
                    data={economies}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEconomyItem}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Layout>
      {!!groupTotal && (
        <View style={styles.row}>
          <Button
            icon="grid-outline"
            name="CSV"
            onPress={() =>
              generateExcel(excelData, `INFORME.${moment(new Date()).format(`DD.MM.YYYY.HH:mm`)}`, [
                [],
                ["Cantidad total", quantity],
                ["Valor total", total],
              ])
            }
          />
          <Button icon="document-text-outline" name="PDF" onPress={() => generatePDF({ html })} />
          <Button
            icon="print-outline"
            name="Imprimir"
            onPress={() => printPDF({ html, height: 460 })}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 4,
  },
  button: {
    width: "auto",
    alignItems: "center",
    borderLeftWidth: 1,
    marginVertical: 0,
    paddingVertical: 15,
    borderRadius: 0,
    flexGrow: 1,
    flexBasis: 0,
    elevation: 0,
  },
});

export default Report;
