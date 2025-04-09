import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStatistics, StatisticsRouteProp } from "domain/entities/navigation";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import StyledText from "presentation/components/text/StyledText";
import { Type } from "domain/enums/data/economy/economy.enums";
import { Economy } from "domain/entities/data";

type CardProps = {
  name: string;
  value: number;
};

const Card: React.FC<CardProps> = ({ name, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <StyledText style={{ marginLeft: 5 }}>{name}</StyledText>
      <StyledText color={value >= 0 ? colors.primary : "#f71010"}>
        {thousandsSystem(value)}
      </StyledText>
    </View>
  );
};

type IndicatorsProps = {
  navigation: StackNavigationProp<RootStatistics>;
  route: StatisticsRouteProp<"Indicators">;
};

const Indicators: React.FC<IndicatorsProps> = ({ route }) => {
  const { colors } = useTheme();

  const economies = route.params.economies;

  const calculateTotal = (economies: Economy[]) =>
    economies.reduce((a, b) => a + b.value * b.quantity, 0);

  const total = useMemo(() => calculateTotal(economies), [economies]);

  const income = useMemo(() => economies.filter((e) => e.type === Type.Income), [economies]);
  const egress = useMemo(() => economies.filter((e) => e.type === Type.Egress), [economies]);

  const percentageIncome = useMemo(
    () => Math.round((income.length / economies.length || 0) * 100),
    [economies],
  );
  const percentageEgress = useMemo(
    () => Math.round((egress.length / economies.length || 0) * 100),
    [economies],
  );

  console.log(income);

  const averageIncome = useMemo(
    () => Math.round(calculateTotal(income) / income.length || 0),
    [income],
  );
  const averageEgress = useMemo(
    () => Math.round(calculateTotal(egress) / egress.length || 0),
    [egress],
  );

  return (
    <Layout>
      <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="cash-outline" color={colors.primary} size={25} />
            <StyledText style={{ marginLeft: 6 }}>VISUALIZACIÓN COSTO/VENTA</StyledText>
          </View>
          {!economies.length && (
            <StyledText color={colors.primary} verySmall>
              NO SE ENCONTRARON INGRESOS/EGRESOS
            </StyledText>
          )}
          <View style={{ marginVertical: 10 }}>
            {economies.map((e) => (
              <Card key={e.id} name={e.category.name} value={e.value * e.quantity} />
            ))}
          </View>
          {economies.length > 0 && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="chatbubble-outline" color={colors.primary} size={25} />
                <StyledText style={{ marginLeft: 6 }}>DETALLES</StyledText>
              </View>
              <View style={{ marginVertical: 10 }}>
                <StyledText>
                  Total: <StyledText color={colors.primary}>{thousandsSystem(total)}</StyledText>
                </StyledText>
                <StyledText>
                  % de ingresos: <StyledText color={colors.primary}>{percentageIncome}%</StyledText>
                </StyledText>
                <StyledText>
                  % de egresos: <StyledText color={colors.primary}>{percentageEgress}%</StyledText>
                </StyledText>
                <StyledText>
                  Promedio de ingresos:{" "}
                  <StyledText color={colors.primary}>{thousandsSystem(averageIncome)}</StyledText>
                </StyledText>
                <StyledText>
                  Promedio de egresos:{" "}
                  <StyledText color={colors.primary}>{thousandsSystem(averageEgress)}</StyledText>
                </StyledText>
              </View>
            </>
          )}
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

export default Indicators;
