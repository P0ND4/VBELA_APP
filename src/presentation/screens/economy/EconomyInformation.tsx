import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import { changeDate, thousandsSystem } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import apiClient, { endpoints } from "infrastructure/api/server";
import { EconomyRouteProp, RootEconomy } from "domain/entities/navigation/root.economy.entity";
import { Economy } from "domain/entities/data";
import { remove } from "application/slice/economies/economies.slice";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import InformationModal from "presentation/components/modal/InformationModal";

const Card: React.FC<{ name: string; value: string }> = ({ name, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText>{name}</StyledText>
      <StyledText color={colors.primary}>{value}</StyledText>
    </View>
  );
};

type EconomyInformationProps = {
  navigation: StackNavigationProp<RootEconomy>;
  route: EconomyRouteProp<"EconomyInformation">;
};

const EconomyInformation: React.FC<EconomyInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const economies = useAppSelector((state) => state.economies);

  const economy = route.params.economy;

  const [data, setData] = useState<Economy>(economy);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `Información: ${data.category.name}` });
  }, [data]);

  useEffect(() => {
    const found = economies.find((s) => s.id === economy.id);
    if (!found) navigation.pop();
    else setData(found);
  }, [economy, economies]);

  const removeData = async () => {
    dispatch(remove({ id: economy.id }));
    await apiClient({
      url: endpoints.economy.delete(economy.id),
      method: "DELETE",
    });
  };

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <Card name="ID" value={data.id} />
          <Card name="Nombre" value={data.category.name} />
          {data.supplier && <Card name="Proveedor" value={data.supplier.name} />}
          <Card name="Tipo" value={data.type} />
          <Card name="Valor" value={thousandsSystem(data.value)} />
          <Card name="Cantidad" value={thousandsSystem(data.quantity)} />
          <Card name="Fecha" value={changeDate(new Date(data.date))} />
          {data.unit && <Card name="Unidad" value={data.unit} />}
          {data.description && (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => setDescriptionModal(true)}
            >
              <StyledText>Descripción</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </TouchableOpacity>
          )}
          {data.reference && <Card name="Referencia" value={data.reference} />}
          {data.brand && <Card name="Marca" value={data.brand} />}
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
      {data.description && (
        <InformationModal
          visible={descriptionModal}
          animationType="fade"
          onClose={() => setDescriptionModal(false)}
          title="Descripción"
        >
          <StyledText color={colors.primary}>{data.description}</StyledText>
        </InformationModal>
      )}
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

export default EconomyInformation;
