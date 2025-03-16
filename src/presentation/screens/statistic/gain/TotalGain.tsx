import React, { useMemo } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { thousandsSystem } from "shared/utils";
import { RootApp, StatisticsRouteProp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";

type CardProps = {
  onPress: () => void;
  order: string;
  value: number;
};

const Card: React.FC<CardProps> = ({ order, value, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress}>
      <StyledText style={{ marginLeft: 5 }}>#{order}</StyledText>
      <StyledText color={colors.primary}>{thousandsSystem(value)}</StyledText>
    </TouchableOpacity>
  );
};

type TotalGainProps = {
  navigation: StackNavigationProp<RootApp>;
  route: StatisticsRouteProp<"TotalGain">;
};

const TotalGain: React.FC<TotalGainProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const orders = route.params.orders;
  const sales = route.params.sales;

  const OTotal = useMemo(() => orders.reduce((a, b) => a + b.total, 0), [orders]);
  const STotal = useMemo(() => sales.reduce((a, b) => a + b.total, 0), [sales]);

  return (
    <Layout>
      <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
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
    </Layout>
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
});

export default TotalGain;
