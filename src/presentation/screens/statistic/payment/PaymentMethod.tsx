import React, { useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { PieChart } from "react-native-gifted-charts";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStatistics, StatisticsRouteProp } from "domain/entities/navigation";

type Icons = keyof typeof Ionicons.glyphMap;

type CardProps = {
  color?: string;
  icon?: Icons | null;
  method: string;
  value: number;
};

const Card: React.FC<CardProps> = ({ color, icon, method, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon && <Ionicons name={icon} size={18} color={color || colors.text} />}
        <StyledText style={{ marginLeft: 5 }}>{method}</StyledText>
      </View>
      <StyledText>{thousandsSystem(value)}</StyledText>
    </View>
  );
};

const NotFound: React.FC = () => {
  const { colors } = useTheme();
  return (
    <StyledText color={colors.primary} verySmall>
      NO SE ENCONTRARON MÉTODOS DE PAGOS
    </StyledText>
  );
};

type PaymentMethodProps = {
  navigation: StackNavigationProp<RootStatistics>;
  route: StatisticsRouteProp<"PaymentMethod">;
};

const PaymentMethod: React.FC<PaymentMethodProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const data = route.params.data;

  const bestValue = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  const totalTimes = data.reduce((a, b) => a + b.times, 0);

  return (
    <Layout>
      <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center" }}>
          <PieChart
            data={data.map((d) => ({ ...d, value: d.times }))}
            sectionAutoFocus
            radius={80}
            innerRadius={50}
            innerCircleColor={colors.background}
            centerLabelComponent={() => {
              return (
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <StyledText smallSubtitle bold>
                    {thousandsSystem((data[0].times / totalTimes) * 100)}%
                  </StyledText>
                  <StyledText>{data[0].name}</StyledText>
                </View>
              );
            }}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="wallet-outline" color={colors.primary} size={25} />
            <StyledText style={{ marginLeft: 6 }}>TOP PAGOS CON MÁS VALOR</StyledText>
          </View>
          {!data.length && <NotFound />}
          <View style={{ marginVertical: 10 }}>
            {bestValue.map((d) => (
              <Card key={d.id} method={d.name} color={d.color} icon={d.icon} value={d.value} />
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="trophy-outline" color={colors.primary} size={25} />
            <StyledText style={{ marginLeft: 6 }}>TOP PAGOS MÁS USADO</StyledText>
          </View>
          {!data.length && <NotFound />}
          <View style={{ marginVertical: 10 }}>
            {data.map((d) => (
              <Card key={d.id} method={d.name} color={d.color} icon={d.icon} value={d.times} />
            ))}
          </View>
        </View>
      </ScrollView>
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

export default PaymentMethod;
