import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Order } from "domain/entities/data/common";
import { changeDate, thousandsSystem } from "shared/utils";
import { generatePDF, printPDF, generateExcel } from "infrastructure/services";
import StyledText from "presentation/components/text/StyledText";
import ModalComponent from "presentation/components/modal/ModalComponent";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import moment from "moment";

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
  product: string;
  quantity: number;
  value: number;
};

const Card: React.FC<CardProps> = ({ product, quantity, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View>
        <StyledText>
          <StyledText color={colors.primary}>X {thousandsSystem(quantity)}</StyledText> {product}
        </StyledText>
      </View>
      <StyledText color={colors.primary}>{thousandsSystem(value)}</StyledText>
    </View>
  );
};

type ReportSelection = {
  id: string;
  name: string;
  quantity: number;
  value: number;
};

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  orders: Order[];
  sales: Order[];
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
  quantities.map((q) => ({ Nombre: q.name, Cantidad: q.quantity, Valor: q.value, Pertenece }));

const ReportModal: React.FC<ReportModalProps> = ({ visible, orders, sales, onClose }) => {
  const { colors } = useTheme();

  const OQuantity = useMemo(() => calculateQuantity(orders), [orders]);
  const SQuantity = useMemo(() => calculateQuantity(sales), [sales]);

  const quantity = useMemo(
    () => [...OQuantity, ...SQuantity].reduce((a, b) => a + b.quantity, 0),
    [OQuantity, SQuantity],
  );
  const total = useMemo(
    () => [...orders, ...sales].reduce((a, b) => a + b.total, 0),
    [orders, sales],
  );

  const excel = [...dataConverter(OQuantity, "Restaurante"), ...dataConverter(SQuantity, "Tienda")];

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
              <p class="text" ">RESTAURANTE/BAR</p>
            </div>
            <div class="space">
              ${OQuantity.reduce((a, order) => {
                return (
                  a +
                  `
                  <div class="row">
                    <span class="text">${`${order.quantity}x ${order.name}`}</span>
                    <span class="text">${thousandsSystem(order.value)}</span>
                  </div>
                `
                );
              }, "")}
            </div>
            <div class="space">
              <p class="text" ">TIENDA</p>
            </div>
            <div class="space">
              ${SQuantity.reduce((a, sale) => {
                return (
                  a +
                  `
                  <div class="row">
                    <span class="text">${`${sale.quantity}x ${sale.name}`}</span>
                    <span class="text">${thousandsSystem(sale.value)}</span>
                  </div>
                `
                );
              }, "")}
            </div>
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

  return (
    <ModalComponent visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <View style={styles.row}>
            <StyledText bigParagraph>INFORME DE VENTAS</StyledText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" color={colors.text} size={30} />
              </TouchableOpacity>
            </View>
          </View>
          <StyledText color={colors.primary}>Visualiza el informe general</StyledText>
          <ScrollView
            style={{ flexGrow: 1, marginVertical: 10 }}
            showsVerticalScrollIndicator={false}
          >
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
                {OQuantity.map((order) => (
                  <Card
                    key={order.id}
                    product={order.name}
                    quantity={order.quantity}
                    value={order.value}
                  />
                ))}
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
                {SQuantity.map((sale) => (
                  <Card
                    key={sale.id}
                    product={sale.name}
                    quantity={sale.quantity}
                    value={sale.value}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
          {!!(sales.length + orders.length) && (
            <View style={styles.row}>
              <Button
                icon="grid-outline"
                name="CSV"
                onPress={() =>
                  generateExcel(excel, `INFORME.${moment(new Date()).format(`DD.MM.YYYY.HH:mm`)}`, [
                    [],
                    ["Cantidad total", quantity],
                    ["Valor total", total],
                  ])
                }
              />
              <Button
                icon="document-text-outline"
                name="PDF"
                onPress={() => generatePDF({ html })}
              />
              <Button
                icon="print-outline"
                name="Imprimir"
                onPress={() => printPDF({ html, height: 460 })}
              />
            </View>
          )}
        </View>
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    width: "90%",
    height: "90%",
    borderRadius: 14,
    padding: 20,
  },
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

export default ReportModal;
