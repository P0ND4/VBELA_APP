import React, { ComponentType, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { thousandsSystem } from "shared/utils";
import { RootApp, StatisticsRouteProp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";

type CardProps = {
  onPress?: () => void;
  title: string;
  value: number | string;
  showHash?: boolean;
};

const Card: React.FC<CardProps> = ({ title, value, onPress, showHash = false }) => {
  const { colors } = useTheme();

  const Container: ComponentType<any> = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <StyledText style={{ marginLeft: 5 }}>{showHash ? `#${title}` : title}</StyledText>
      <StyledText color={colors.primary}>{thousandsSystem(value)}</StyledText>
    </Container>
  );
};

type TotalGainProps = {
  navigation: StackNavigationProp<RootApp>;
  route: StatisticsRouteProp<"TotalGain">;
};

const TotalGain: React.FC<TotalGainProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const { orders, sales, economies } = route.params;

  const OTotal = useMemo(() => orders.reduce((a, b) => a + b.total, 0), [orders]);
  const STotal = useMemo(() => sales.reduce((a, b) => a + b.total, 0), [sales]);
  const ETotal = useMemo(() => economies.reduce((a, b) => a + b.value, 0), [economies]);

  const totalQuantity = useMemo(
    () => sales.length + orders.length + economies.length,
    [sales, orders, economies],
  );

  const totalValue = useMemo(() => OTotal + STotal + ETotal, [OTotal, STotal, ETotal]);

  const renderItem = (item: any, type: "order" | "sale" | "movement" | "economy") => {
    switch (type) {
      case "order":
        return (
          <Card
            key={item.id}
            title={item.order}
            value={item.total}
            showHash={true}
            onPress={() => {
              navigation.navigate("OrderRoutes", {
                screen: "MenuViewOrder",
                params: { order: item },
              });
            }}
          />
        );
      case "sale":
        return (
          <Card
            key={item.id}
            title={item.order}
            value={item.total}
            showHash={true}
            onPress={() => {
              navigation.navigate("OrderRoutes", {
                screen: "ProductViewOrder",
                params: { order: item },
              });
            }}
          />
        );
      case "movement":
        return <Card key={item.id} title={item.type} value={item.quantity * item.currentValue} />;
      case "economy":
        return <Card key={item.id} title={item.type} value={item.value} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Layout>
        <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View>
            {/* Restaurante/Bar */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="pricetag-outline" color={colors.primary} size={25} />
              <StyledText style={{ marginLeft: 6 }}>RESTAURANTE/BAR</StyledText>
            </View>
            <StyledText verySmall color={colors.primary}>
              {orders.length
                ? `HAY UN TOTAL DE ${thousandsSystem(orders.length)} ÓRDENES CON UN VALOR DE ${thousandsSystem(OTotal)}`
                : "NO SE ENCONTRARON ÓRDENES"}
            </StyledText>
            <View style={{ marginVertical: 10 }}>
              <FlatList
                data={orders}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem(item, "order")}
              />
            </View>

            {/* Tienda */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="storefront-outline" color={colors.primary} size={25} />
              <StyledText style={{ marginLeft: 6 }}>TIENDA</StyledText>
            </View>
            <StyledText verySmall color={colors.primary}>
              {sales.length
                ? `HAY UN TOTAL DE ${thousandsSystem(sales.length)} VENTAS CON UN VALOR DE ${thousandsSystem(STotal)}`
                : "NO SE ENCONTRARON VENTAS"}
            </StyledText>
            <View style={{ marginVertical: 10 }}>
              <FlatList
                data={sales}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem(item, "sale")}
              />
            </View>

            {/* Ingresos/Egresos */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="cash-outline" color={colors.primary} size={25} />
              <StyledText style={{ marginLeft: 6 }}>INGRESOS/EGRESOS</StyledText>
            </View>
            <StyledText verySmall color={colors.primary}>
              {economies.length
                ? `HAY UN TOTAL DE ${thousandsSystem(economies.length)} INGRESOS/EGRESOS CON UN VALOR DE ${thousandsSystem(ETotal)}`
                : "NO SE ENCONTRARON INGRESOS/EGRESOS"}
            </StyledText>
            <View style={{ marginVertical: 10 }}>
              <FlatList
                data={economies}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem(item, "economy")}
              />
            </View>
          </View>
        </ScrollView>
      </Layout>
      {/* Resumen total */}
      {!!totalQuantity && (
        <View style={{ padding: 20, borderTopWidth: 1, borderColor: colors.border }}>
          <StyledText>
            Pedidos totales:{" "}
            <StyledText color={colors.primary}>{thousandsSystem(totalQuantity)}</StyledText>
          </StyledText>
          <StyledText>
            Valor total:{" "}
            <StyledText color={colors.primary}>{thousandsSystem(totalValue)}</StyledText>
          </StyledText>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
