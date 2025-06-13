import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native";
import Layout from "presentation/components/layout/Layout";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { changeDate, thousandsSystem } from "shared/utils";
import { Portion, Stock } from "domain/entities/data/inventories";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledTextInformation from "presentation/components/text/StyledTextInformation";
import { batch } from "react-redux";
import { removeIngredient } from "application/slice/inventories/recipes.slice";
import { remove } from "application/slice/inventories/portions.slice";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import apiClient from "infrastructure/api/server";
import endpoints from "config/constants/api.endpoints";

const Card: React.FC<{ name: string; value: string }> = ({ name, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText>{name}</StyledText>
      <StyledText color={colors.primary}>{value}</StyledText>
    </View>
  );
};

type Ingredient = { id: string; quantity: number };

const IngredientCard: React.FC<{ ingredient: Ingredient }> = ({ ingredient }) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);

  const [stock, setStock] = useState<Stock | null>(null);

  useEffect(() => {
    const found = stocks.find((s) => s.id === ingredient.id);
    setStock(found ?? null);
  }, [stocks]);

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText color={colors.primary}>
        {thousandsSystem(ingredient.quantity)}x{" "}
        <StyledText>{stock ? `${stock.name}` : "Eliminado"}</StyledText>
      </StyledText>
      <StyledText>{thousandsSystem((stock?.currentValue ?? 1) * ingredient.quantity)}</StyledText>
    </View>
  );
};

type IngredientsModalProps = {
  portion: Portion;
  visible: boolean;
  onClose: () => void;
};

const IngredientsModal: React.FC<IngredientsModalProps> = ({ portion, visible, onClose }) => {
  const stocks = useAppSelector((state) => state.stocks);

  const cost = useMemo(
    () =>
      portion.ingredients.reduce((a, b) => {
        const { currentValue = 0 } = stocks.find((s) => s.id === b.id) ?? {};
        return a + currentValue * b.quantity;
      }, 0),
    [portion.ingredients, stocks],
  );

  return (
    <ScreenModal title="Ingredientes" visible={visible} onClose={onClose}>
      <FlatList
        data={portion.ingredients}
        style={{ flexGrow: 1 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IngredientCard ingredient={item} />}
      />
      <View style={{ padding: 20 }}>
        <StyledTextInformation
          label="Costo del stock"
          value={`${thousandsSystem(cost)}`}
          valueColor="#f71010"
        />
      </View>
    </ScreenModal>
  );
};

type PortionInformationProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"PortionInformation">;
};

const PortionInformation: React.FC<PortionInformationProps> = ({ navigation, route }) => {
  const { emit } = useWebSocketContext();
  const { colors } = useTheme();

  const portions = useAppSelector((state) => state.portions);

  const portion = route.params.portion;

  const [data, setData] = useState<Portion>(portion);
  const [ingredientsModal, setIngredientsModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `Información: ${data.name}` });
  }, [data]);

  useEffect(() => {
    const found = portions.find((s) => s.id === portion.id);
    if (!found) navigation.pop();
    else setData(found);
  }, [portions, portion]);

  const removeData = async () => {
    batch(() => {
      dispatch(remove({ id: portion.id }));
      dispatch(removeIngredient({ id: portion.id }));
    });
    await apiClient({
      url: endpoints.portion.delete(portion.id),
      method: "DELETE",
    });
    emit("accessToInventory");
  };

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <ScrollView>
          <Card name="ID" value={data.id} />
          <Card name="Nombre" value={data.name} />
          {data.description && <Card name="Descripción" value={data.description} />}
          {data.ingredients.length > 0 && (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => setIngredientsModal(true)}
            >
              <StyledText>Ingredientes</StyledText>
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
      <IngredientsModal
        portion={data}
        visible={ingredientsModal}
        onClose={() => setIngredientsModal(false)}
      />
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

export default PortionInformation;
