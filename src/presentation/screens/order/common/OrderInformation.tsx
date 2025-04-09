import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Selection } from "domain/entities/data/common";
import { thousandsSystem } from "shared/utils";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";

const Card: React.FC<{ item: Selection }> = ({ item }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={{ flexDirection: "row" }}>
        <StyledText style={{ marginRight: 15 }}>{thousandsSystem(item.quantity)}x</StyledText>
        <StyledText>{item.name}</StyledText>
      </View>
      <StyledText>
        {!item.total ? "GRATIS" : thousandsSystem(item.total)}{" "}
        {!!item.discount && (
          <StyledText color={colors.primary}>
            {`(-${thousandsSystem(item.quantity * item.value * item.discount)})`}
          </StyledText>
        )}
      </StyledText>
    </View>
  );
};

const OrderInformation: React.FC<{ selection: Selection[] }> = ({ selection }) => {
  return (
    <Layout style={{ padding: 0 }}>
      <FlatList
        data={selection}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Card item={item} />}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default OrderInformation;
