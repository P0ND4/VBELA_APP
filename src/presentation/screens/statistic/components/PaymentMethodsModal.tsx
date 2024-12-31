import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PieChart } from "react-native-gifted-charts";
import { PaymentMethodSummary } from "../Statistic";
import { thousandsSystem } from "shared/utils";
import StyledText from "presentation/components/text/StyledText";
import ModalComponent from "presentation/components/modal/ModalComponent";
import Ionicons from "@expo/vector-icons/Ionicons";

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

type PaymentMethodsModalProps = {
  data: PaymentMethodSummary[];
  visible: boolean;
  onClose: () => void;
};

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ visible, data, onClose }) => {
  const { colors } = useTheme();

  const bestValue = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  const totalTimes = data.reduce((a, b) => a + b.times, 0);

  return (
    <ModalComponent visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <View style={styles.row}>
            <StyledText bigParagraph>MEDIO DE PAGOS</StyledText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" color={colors.text} size={30} />
              </TouchableOpacity>
            </View>
          </View>
          <StyledText color={colors.primary}>Vé los los métodos de pagos</StyledText>
          <ScrollView
            style={{ flexGrow: 1, marginVertical: 10 }}
            showsVerticalScrollIndicator={false}
          >
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
                      <StyledText>{data[0].text}</StyledText>
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
                  <Card key={d.id} method={d.text} color={d.color} icon={d.icon} value={d.value} />
                ))}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="trophy-outline" color={colors.primary} size={25} />
                <StyledText style={{ marginLeft: 6 }}>TOP PAGOS MÁS USADO</StyledText>
              </View>
              {!data.length && <NotFound />}
              <View style={{ marginVertical: 10 }}>
                {data.map((d) => (
                  <Card key={d.id} method={d.text} color={d.color} icon={d.icon} value={d.times} />
                ))}
              </View>
            </View>
          </ScrollView>
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

export default PaymentMethodsModal;
