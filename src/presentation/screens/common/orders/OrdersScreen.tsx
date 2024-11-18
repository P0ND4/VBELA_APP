import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";

const Order = () => {
  return (
    <TouchableOpacity style={{ marginVertical: 10 }}>
      <View style={styles.row}>
        <View style={styles.alignHorizontally}>
          <Ionicons name="time-outline" size={25} />
          <StyledText style={{ marginHorizontal: 4 }}>2.00</StyledText>
          <StyledText>por NOMBRE</StyledText>
        </View>
        <StyledText>14:22</StyledText>
      </View>
      <View style={styles.row}>
        <StyledText smallParagraph>1x EO 1x Test</StyledText>
        <StyledText smallParagraph>#1-5</StyledText>
      </View>
    </TouchableOpacity>
  );
};

const Card = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText smallSubtitle>sábado, 28 de sep. de 2024</StyledText>
      <StyledText color={colors.primary}>1 pedido, $2.00</StyledText>
      <View style={{ marginTop: 15 }}>
        {["", ""].map(() => (
          <Order />
        ))}
      </View>
    </View>
  );
};

const OrdersScreen = () => {
  const { colors } = useTheme();

  return (
    <Layout style={{ padding: 0, justifyContent: "space-between" }}>
      <StyledInput
        placeholder="Item, cliente, precio o código"
        stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
        stylesInput={{ paddingVertical: 15 }}
        left={() => <Ionicons name="search" size={25} color={colors.text} />}
      />
      <View style={{ flex: 1 }}>
        <View style={[styles.filterContainer, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.alignHorizontally}
            onPress={() => alert("Para la segunda actualización")}
          >
            <Ionicons name="time" size={25} />
            <StyledText style={{ marginHorizontal: 5 }}>Todos los estados</StyledText>
            <Ionicons name={false ? "caret-up" : "caret-down"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.alignHorizontally}
            onPress={() => alert("Para la segunda actualización")}
          >
            <Ionicons name="people-outline" size={25} />
            <StyledText style={{ marginHorizontal: 5 }}>Vendedores</StyledText>
            <Ionicons name={false ? "caret-up" : "caret-down"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.alignHorizontally}
            onPress={() => alert("Para la segunda actualización")}
          >
            <Ionicons name="bookmarks-outline" size={25} />
            <StyledText style={{ marginHorizontal: 5 }}>Todas las localidades</StyledText>
            <Ionicons name={false ? "caret-up" : "caret-down"} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flexGrow: 1 }}>
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </ScrollView>
      </View>
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <StyledText bigParagraph bold>
          Total en pedidos
        </StyledText>
        <StyledText>$14.60 de 2 pedidos</StyledText>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    height: 75,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  card: {
    padding: 20,
    borderBottomWidth: 0.5,
  },
  alignHorizontally: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
});

export default OrdersScreen;
