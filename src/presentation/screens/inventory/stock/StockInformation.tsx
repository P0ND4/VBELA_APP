import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import Layout from "presentation/components/layout/Layout";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { changeDate, random, thousandsSystem } from "shared/utils";
import { Movement, Stock } from "domain/entities/data/inventories";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { remove } from "application/slice/inventories/stocks.slice";
import { removeIngredient as removeRecipeIngredient } from "application/slice/inventories/recipes.slice";
import { removeIngredient as removePortionIngredient } from "application/slice/inventories/portions.slice";
import { batch } from "react-redux";
import { removeStock as removeStockProduct } from "application/slice/stores/products.slice";
import { removeStock as removeStockMenu } from "application/slice/restaurants/menu.slice";
import apiClient from "infrastructure/api/server";
import { add, removeByStockID } from "application/slice/inventories/movements.slice";
import { Type } from "domain/enums/data/inventory/movement.enums";
import { useMovementsMap } from "../hooks/useMovementsMap";
import endpoints from "config/constants/api.endpoints";
import { useWebSocketContext } from "infrastructure/context/SocketContext";

const Card: React.FC<{ name: string; value: string }> = ({ name, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText>{name}</StyledText>
      <StyledText color={colors.primary}>{value}</StyledText>
    </View>
  );
};

type StockInformationProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"StockInformation">;
};

const StockInformation: React.FC<StockInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const inventories = useAppSelector((state) => state.inventories);
  const stocks = useAppSelector((state) => state.stocks);
  const movements = useAppSelector((state) => state.movements);

  const inventoriesMap = new Map(inventories.map((i) => [i.id, i]));

  const stock = route.params.stock;

  const movementsMap = useMovementsMap();
  const quantity = useMemo(() => movementsMap.get(stock.id) || 0, [movementsMap, stock.id]);

  const [data, setData] = useState<Stock>(stock);

  const dispatch = useAppDispatch();

  const supplyStock = () => {
    Alert.alert(
      "Oye!",
      "¿Estás seguro que deseas abastecer el stock? Se agregara un movimiento de entrada",
      [
        { text: "No", style: "cancel" },
        {
          text: "Si",
          onPress: async () => {
            const inventory = inventoriesMap.get(stock.inventoryID);

            const movement: Movement = {
              id: random(10),
              reason: "COMPRA",
              type: Type.Entry,
              inventory: { id: inventory!.id, name: inventory!.name },
              stock: {
                id: stock.id,
                name: stock.name,
                unit: stock.unit,
                currentValue: stock.currentValue,
              },
              supplier: null,
              supplierValue: 0,
              quantity: stock.upperLimit - quantity,
              currentValue: stock.currentValue,
              date: new Date().getTime(),
              paymentMethod: "",
              creationDate: new Date().getTime(),
              modificationDate: new Date().getTime(),
            };

            dispatch(add(movement));
            await apiClient({
              url: endpoints.movement.post(),
              method: "POST",
              data: movement,
            });
            emit("accessToInventory");
          },
        },
      ],
      { cancelable: true },
    );
  };

  const deleteMovements = () => {
    Alert.alert(
      "Oye!",
      "¿Estás seguro que deseas restaurar el stock? Se eliminarán todos los movimientos",
      [
        { text: "No", style: "cancel" },
        {
          text: "Si",
          onPress: async () => {
            dispatch(removeByStockID({ id: stock.id }));
            await apiClient({
              url: endpoints.movement.deleteMultiple(stock.id),
              method: "DELETE",
            });
            emit("accessToInventory");
          },
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    navigation.setOptions({ title: `Información: ${data.name}` });
  }, [data]);

  useEffect(() => {
    const found = stocks.find((s) => s.id === stock.id);
    if (!found) navigation.pop();
    else setData(found);
  }, [stocks, stock]);

  const movement: boolean = useMemo(
    () => movements.some((e) => e.stock?.id === stock.id),
    [movements],
  );

  const removeData = async () => {
    batch(() => {
      dispatch(remove({ id: stock.id }));
      dispatch(removePortionIngredient({ id: stock.id }));
      dispatch(removeRecipeIngredient({ id: stock.id }));
      dispatch(removeStockProduct({ ids: [stock.id] }));
      dispatch(removeStockMenu({ ids: [stock.id] }));
    });

    await apiClient({
      url: endpoints.stock.delete(stock.id),
      method: "DELETE",
    });
  };

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <Card name="ID" value={data.id} />
          <Card name="Nombre" value={data.name} />
          {data.unit && <Card name="Unidad" value={data.unit} />}
          <Card name="Visible" value={data.visible ? "Si" : "No"} />
          <Card name="Cantidad" value={thousandsSystem(quantity)} />
          <Card name="Punto de reorden" value={thousandsSystem(data.reorder)} />
          <Card name="Límite superior" value={thousandsSystem(data.upperLimit)} />
          {data.reference && <Card name="Referencia" value={data.reference} />}
          {data.brand && <Card name="Marca" value={data.brand} />}
          {movement && (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => navigation.navigate("MovementInformation", { stockID: stock.id })}
            >
              <StyledText>Movimiento</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </TouchableOpacity>
          )}
          <Card name="Valor actual" value={thousandsSystem(data.currentValue)} />
          <Card name="Fecha de creación" value={changeDate(new Date(data.creationDate), true)} />
          <Card
            name="Fecha de modificación"
            value={changeDate(new Date(data.modificationDate), true)}
          />
          <View style={[styles.card, styles.containerEventButtons, { borderColor: colors.border }]}>
            {!!data.upperLimit && quantity < data.upperLimit && (
              <TouchableOpacity
                style={[styles.eventButtons, { borderColor: colors.border }]}
                onPress={supplyStock}
              >
                <StyledText color={colors.primary}>Abastecer</StyledText>
              </TouchableOpacity>
            )}
            {movement && (
              <TouchableOpacity
                style={[styles.eventButtons, { borderColor: colors.border }]}
                onPress={deleteMovements}
              >
                <StyledText color={colors.primary}>Restaurar Stock</StyledText>
              </TouchableOpacity>
            )}
          </View>
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
  containerEventButtons: { paddingVertical: 0, paddingHorizontal: 0 },
  eventButtons: {
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    paddingVertical: 20,
    flexBasis: 1,
    flexGrow: 1,
    alignItems: "center",
  },
});

export default StockInformation;
