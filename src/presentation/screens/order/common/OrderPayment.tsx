import React from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { PaymentMethod } from "domain/entities/data/common";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";

type CardProps = {
  paymentMethod: PaymentMethod;
  onRemove: (id: string) => void;
  isRemove: boolean;
};

const Card: React.FC<CardProps> = ({ paymentMethod, onRemove, isRemove }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={paymentMethod.icon} color={colors.text} size={32} />
        <StyledText style={{ marginHorizontal: 15 }}>{paymentMethod.method}</StyledText>
        <StyledText>{thousandsSystem(paymentMethod.amount)}</StyledText>
      </View>
      {isRemove && (
        <TouchableOpacity onPress={() => onRemove(paymentMethod.id)}>
          <Ionicons name="close-circle-outline" color={colors.text} size={32} />
        </TouchableOpacity>
      )}
    </View>
  );
};

type OrderPaymentProps = {
  paymentMethods: PaymentMethod[];
  onRemove: (id: string) => void;
  isRemove: boolean;
};

const OrderPayment: React.FC<OrderPaymentProps> = ({
  paymentMethods,
  onRemove,
  isRemove = true,
}) => {
  return (
    <Layout style={{ padding: 0 }}>
      <FlatList
        data={paymentMethods}
        style={{ flexGrow: 1 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card paymentMethod={item} onRemove={onRemove} isRemove={isRemove} />
        )}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
});

export default OrderPayment;
