import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useAppSelector } from "application/store/hook";
import type { Supplier as SupplierType } from "domain/entities/data";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ supplier: SupplierType }> = ({ supplier }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() =>
        navigation.navigate("SupplierRoutes", {
          screen: "SupplierInformation",
          params: { supplier },
        })
      }
      onLongPress={() =>
        navigation.navigate("SupplierRoutes", { screen: "CreateSupplier", params: { supplier } })
      }
    >
      <View style={styles.row}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {supplier.highlight && (
            <Ionicons name="star" color={colors.primary} size={18} style={{ marginRight: 6 }} />
          )}
          <StyledText>{supplier.name}</StyledText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </View>
    </TouchableOpacity>
  );
};

const Supplier: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const suppliers = useAppSelector((state) => state.suppliers);

  const [data, setData] = useState<SupplierType[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20, flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.navigate("SupplierRoutes", { screen: "CreateSupplier" })}
        >
          <Ionicons name="add" color={colors.primary} size={20} />
          <StyledText smallParagraph>Proveedor</StyledText>
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    const data = [...suppliers].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0));
    if (!search) return setData(data);
    const searchTerm = search.toLowerCase();
    const filtered = data.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm) ||
        s.identification.toLowerCase().includes(searchTerm),
    );
    setData(filtered);
  }, [search, suppliers]);

  return (
    <Layout style={{ padding: 0 }}>
      {!suppliers.length ? (
        <StyledText color={colors.primary} style={{ margin: 20 }}>
          NO HAY PROVEEDORES REGISTRADOS
        </StyledText>
      ) : (
        <>
          <StyledInput
            placeholder="Buscar por nombre"
            stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
            stylesInput={{ paddingVertical: 15 }}
            onChangeText={setSearch}
            left={() => <Ionicons name="search" size={25} color={colors.text} />}
          />
          {!data.length && (
            <StyledText color={colors.primary} style={{ margin: 20 }}>
              NO SE ENCONTRARON PROVEEDORES
            </StyledText>
          )}
          <FlatList
            data={data}
            style={{ flexGrow: 1 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Card supplier={item} />}
          />
        </>
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
  economy: {
    width: "auto",
    marginVertical: 0,
    paddingHorizontal: 25,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
  },
});

export default Supplier;
