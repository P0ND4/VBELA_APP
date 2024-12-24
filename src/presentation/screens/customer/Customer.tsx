import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import { useNavigation, useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppSelector } from "application/store/hook";
import type { Customer as CustomerType } from "domain/entities/data/customers";
import { thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import Filter from "./components/Filter";
import Footer from "./components/Footer";

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ customer: CustomerType }> = ({ customer }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() =>
        navigation.navigate("CustomerRoutes", {
          screen: "CustomerInformation",
          params: { customer },
        })
      }
    >
      <View style={styles.row}>
        <StyledText>{customer.name}</StyledText>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </View>
      {customer.agency && (
        <StyledText verySmall color={colors.primary}>
          AGENCIA: <StyledText verySmall>{thousandsSystem(customer.people)} REGISTRADO</StyledText>
        </StyledText>
      )}
    </TouchableOpacity>
  );
};

const Customer: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const customers = useAppSelector((state) => state.customers);

  const [positive, setPositive] = useState<boolean>(false);
  const [negative, setNegative] = useState<boolean>(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 20 }}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="reader-outline" color={colors.primary} size={30} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 4 }} onPress={() => {}}>
            <Ionicons name="download-outline" color={colors.primary} size={30} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomerRoutes", { screen: "CreateCustomer" })}
          >
            <Ionicons name="add" color={colors.primary} size={30} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  return (
    <Layout style={{ padding: 0, justifyContent: "space-between" }}>
      {!customers.length ? (
        <StyledText color={colors.primary} style={{ margin: 20 }}>
          NO HAY CLIENTES REGISTRADOS
        </StyledText>
      ) : (
        <>
          <View>
            <StyledInput
              placeholder="Busca por nombre, email o teléfono"
              stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
              stylesInput={{ paddingVertical: 15 }}
              left={() => <Ionicons name="search" size={25} color={colors.text} />}
            />
            <View style={styles.filterContainer}>
              <Filter
                onPress={() => setPositive(!positive)}
                value={positive}
                name="SALDO NEGATIVO"
              />
              <Filter
                onPress={() => setNegative(!negative)}
                value={negative}
                name="SALDO POSITIVO"
              />
            </View>
            <View style={{ marginVertical: 5 }}>
              <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Card customer={item} />}
              />
            </View>
          </View>
          <Footer positive={positive} negative={negative} />
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  card: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
});

export default Customer;
