import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import { changeDate } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import apiClient, { endpoints } from "infrastructure/api/server";
import { RootSupplier, SupplierRouteProp } from "domain/entities/navigation/root.supplier.entity";
import { Supplier } from "domain/entities/data";
import { remove } from "application/slice/suppliers/suppliers.slice";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

const Card: React.FC<{ name: string; value: string }> = ({ name, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText>{name}</StyledText>
      <StyledText color={colors.primary}>{value}</StyledText>
    </View>
  );
};

type SupplierInformationProps = {
  navigation: StackNavigationProp<RootSupplier>;
  route: SupplierRouteProp<"SupplierInformation">;
};

const SupplierInformation: React.FC<SupplierInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const suppliers = useAppSelector((state) => state.suppliers);
  const economies = useAppSelector((state) => state.economies);

  const supplier = route.params.supplier;

  const [data, setData] = useState<Supplier>(supplier);

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `Información: ${data.name}` });
  }, [data]);

  useEffect(() => {
    const found = suppliers.find((s) => s.id === supplier.id);
    if (!found) navigation.pop();
    else setData(found);
  }, [suppliers, supplier]);

  const economy: boolean = useMemo(
    () => economies.some((e) => e.supplier?.id === supplier.id),
    [economies],
  );

  const removeData = async () => {
    dispatch(remove({ id: supplier.id }));
    await apiClient({
      url: endpoints.supplier.delete(supplier.id),
      method: "DELETE",
    });
  };

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <Card name="ID" value={data.id} />
          <Card name="Nombre" value={data.name} />
          {data.identification && <Card name="Identificación" value={data.identification} />}
          {data.description && <Card name="Descripción" value={data.description} />}
          {economy && (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => navigation.navigate("EconomyInformation", { supplierID: supplier.id })}
            >
              <StyledText>Movimiento</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </TouchableOpacity>
          )}
          <Card name="Fecha de creación" value={changeDate(new Date(data.creationDate), true)} />
          <Card
            name="Fecha de modificación"
            value={changeDate(new Date(data.modificationDate), true)}
          />
          <TouchableOpacity
            style={[styles.card, { borderColor: colors.border, justifyContent: "center" }]}
            onPress={removeData}
          >
            <StyledText color={colors.primary}>Eliminar</StyledText>
          </TouchableOpacity>
        </ScrollView>
      </Layout>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default SupplierInformation;
