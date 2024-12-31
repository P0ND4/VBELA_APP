import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Order } from "domain/entities/data/common";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import StyledText from "presentation/components/text/StyledText";
import ModalComponent from "presentation/components/modal/ModalComponent";
import Ionicons from "@expo/vector-icons/Ionicons";

type CardProps = {
  onPress: () => void;
  order: string;
  value: number;
};

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<CardProps> = ({ order, value, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress}>
      <StyledText style={{ marginLeft: 5 }}>#{order}</StyledText>
      <StyledText color={colors.primary}>{thousandsSystem(value)}</StyledText>
    </TouchableOpacity>
  );
};

type TotalGainModalProps = {
  orders: Order[];
  sales: Order[];
  visible: boolean;
  onClose: () => void;
};

const TotalGainModal: React.FC<TotalGainModalProps> = ({ visible, orders, sales, onClose }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  const OTotal = useMemo(() => orders.reduce((a, b) => a + b.total, 0), [orders]);
  const STotal = useMemo(() => sales.reduce((a, b) => a + b.total, 0), [sales]);

  return (
    <ModalComponent visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <View style={styles.row}>
            <StyledText bigParagraph>GANANCIA TOTAL</StyledText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" color={colors.text} size={30} />
              </TouchableOpacity>
            </View>
          </View>
          <StyledText color={colors.primary}>Míra de donde se distribuyen las ganancias</StyledText>
          <ScrollView
            style={{ flexGrow: 1, marginVertical: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="pricetag-outline" color={colors.primary} size={25} />
                <StyledText style={{ marginLeft: 6 }}>RESTAURANTE/BAR</StyledText>
              </View>
              <StyledText verySmall color={colors.primary}>
                {!!orders.length
                  ? `HAY UN TOTAL DE ${thousandsSystem(orders.length)} ORDENES CON UN VALOR DE ${thousandsSystem(OTotal)}`
                  : "NO SE ENCONTRARON ORDENES"}
              </StyledText>
              <View style={{ marginVertical: 10 }}>
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    order={order.order}
                    value={order.total}
                    onPress={() => {
                      onClose();
                      navigation.navigate("OrderRoutes", {
                        screen: "MenuViewOrder",
                        params: { order },
                      });
                    }}
                  />
                ))}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="storefront-outline" color={colors.primary} size={25} />
                <StyledText style={{ marginLeft: 6 }}>TIENDA</StyledText>
              </View>
              <StyledText verySmall color={colors.primary}>
                {!!sales.length
                  ? `HAY UN TOTAL DE ${thousandsSystem(sales.length)} VENTAS CON UN VALOR DE ${thousandsSystem(OTotal)}`
                  : "NO SE ENCONTRARON VENTAS"}
              </StyledText>
              <View style={{ marginVertical: 10 }}>
                {sales.map((sale) => (
                  <Card
                    key={sale.id}
                    order={sale.order}
                    value={sale.total}
                    onPress={() => {
                      onClose();
                      navigation.navigate("OrderRoutes", {
                        screen: "ProductViewOrder",
                        params: { order: sale },
                      });
                    }}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
          {!!(sales.length + orders.length) && (
            <View>
              <StyledText>
                Pedidos totales:{" "}
                <StyledText color={colors.primary}>
                  {thousandsSystem(orders.length + sales.length)}
                </StyledText>
              </StyledText>
              <StyledText>
                Valor total:{" "}
                <StyledText color={colors.primary}>{thousandsSystem(OTotal + STotal)}</StyledText>
              </StyledText>
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
});

export default TotalGainModal;
