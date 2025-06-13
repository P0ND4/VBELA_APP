import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet, FlatList, ListRenderItem } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import type { Inventory as InventoryType, Portion, Stock } from "domain/entities/data/inventories";
import { useNavigation, useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import InformationModal from "presentation/components/modal/InformationModal";
import { changeDate, thousandsSystem } from "shared/utils";
import { remove } from "application/slice/inventories/inventories.slice";
import { batch } from "react-redux";
import { removeInventory as removeInventoryRestaurant } from "application/slice/restaurants/restaurants.slices";
import { removeInventory as removeInventoryStore } from "application/slice/stores/stores.slice";
import apiClient from "infrastructure/api/server";
import { removeByInventoryID as removeByInventoryIDStock } from "application/slice/inventories/stocks.slice";
import { removeByInventoryID as removeByInventoryIDRecipe } from "application/slice/inventories/recipes.slice";
import {
  removeRecipe as removeRecipeProduct,
  removeStock as removeStockProduct,
} from "application/slice/stores/products.slice";
import {
  removeRecipe as removeRecipeMenu,
  removeStock as removeStockMenu,
} from "application/slice/restaurants/menu.slice";
import { removeByInventoryID as removeByInventoryIDStockGroup } from "application/slice/inventories/stock.group.slice";
import { removeByInventoryID as removeByInventoryIDRecipeGroup } from "application/slice/inventories/recipe.group.slice";
import { removeByInventoryID as removeByInventoryIDPortion } from "application/slice/inventories/portions.slice";
import { removeByInventoryID as removeByInventoryIDPortionGroup } from "application/slice/inventories/portion.group.slice";
import { useMovementsMap } from "./hooks/useMovementsMap";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { calculateCost } from "./portion/Portion";
import endpoints from "config/constants/api.endpoints";

type CardInformationProps = {
  visible: boolean;
  onClose: () => void;
  onPressEdit: () => void;
  onPressDelete: () => void;
  inventory: InventoryType;
};

const CardInformation: React.FC<CardInformationProps> = ({
  visible,
  onClose,
  onPressDelete,
  onPressEdit,
  inventory,
}) => {
  const { colors } = useTheme();

  return (
    <InformationModal
      title="Información"
      visible={visible}
      animationType="fade"
      onClose={onClose}
      headerRight={() => (
        <>
          <TouchableOpacity onPress={onPressDelete}>
            <Ionicons name="trash-outline" color={colors.text} size={30} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressEdit}>
            <Ionicons name="create-outline" color={colors.text} size={30} style={styles.icon} />
          </TouchableOpacity>
        </>
      )}
    >
      <View style={{ marginTop: 10 }}>
        <StyledText>
          Nombre: <StyledText color={colors.primary}>{inventory.name}</StyledText>
        </StyledText>
        {inventory.description && (
          <StyledText>
            Descripción: <StyledText color={colors.primary}>{inventory.description}</StyledText>
          </StyledText>
        )}
        <StyledText>
          Fecha de creación:{" "}
          <StyledText color={colors.primary}>
            {changeDate(new Date(inventory.creationDate), true)}
          </StyledText>
        </StyledText>
        <StyledText>
          Fecha de modificación:{" "}
          <StyledText color={colors.primary}>
            {changeDate(new Date(inventory.modificationDate), true)}
          </StyledText>
        </StyledText>
      </View>
    </InformationModal>
  );
};

const calculateInventoryTotal = (
  inventoryId: string,
  portions: Portion[],
  stocks: Stock[],
  quantities: Map<string, number>,
) => {
  const portionValue = portions
    .filter((p) => p.inventoryID === inventoryId)
    .reduce((acc, p) => acc + calculateCost(p, stocks) * p.quantity, 0);

  const stockValue = stocks
    .filter((s) => s.inventoryID === inventoryId)
    .reduce((acc, s) => acc + (quantities.get(s.id) || 0) * s.currentValue, 0);

  return portionValue + stockValue;
};

//TODO LA INFORMACIÓN DE LOCATIONINFORMATION ES MUY PARECIDA A ESTE, REFACTORIZAR

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ item: InventoryType }> = ({ item }) => {
  const stocks = useAppSelector((state) => state.stocks);
  const portions = useAppSelector((state) => state.portions);
  const recipes = useAppSelector((state) => state.recipes);

  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const [showInformation, setShowInformation] = useState<boolean>(false);

  const quantities = useMovementsMap();
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useAppDispatch();

  const total = useMemo(() => {
    return calculateInventoryTotal(item.id, portions, stocks, quantities);
  }, [item.id, portions, stocks, quantities]);

  const removeData = useCallback(async () => {
    const stockIDS = stocks
      .filter((stock) => stock.inventoryID === item.id)
      .map((stock) => stock.id);
    const recipeIDS = recipes
      .filter((recipe) => recipe.inventoryID === item.id)
      .map((recipe) => recipe.id);

    batch(() => {
      dispatch(remove({ id: item.id }));
      dispatch(removeInventoryRestaurant({ id: item.id }));
      dispatch(removeInventoryStore({ id: item.id }));
      dispatch(removeByInventoryIDStock({ inventoryID: item.id }));
      dispatch(removeByInventoryIDRecipe({ inventoryID: item.id }));
      dispatch(removeByInventoryIDPortion({ inventoryID: item.id }));
      dispatch(removeStockProduct({ ids: stockIDS }));
      dispatch(removeStockMenu({ ids: stockIDS }));
      dispatch(removeRecipeProduct({ ids: recipeIDS }));
      dispatch(removeRecipeMenu({ ids: recipeIDS }));
      dispatch(removeByInventoryIDStockGroup({ inventoryID: item.id }));
      dispatch(removeByInventoryIDRecipeGroup({ inventoryID: item.id }));
      dispatch(removeByInventoryIDPortionGroup({ inventoryID: item.id }));
    });

    await apiClient({
      url: endpoints.inventory.delete(item.id),
      method: "DELETE",
    });
    emit("accessToInventory");
  }, [dispatch, item.id, recipes, stocks]);

  return (
    <>
      <StyledButton
        onPress={() => {
          navigation.navigate("InventoryRoutes", {
            screen: "StockTab",
            params: { inventory: item },
          });
        }}
        onLongPress={() => setShowInformation(true)}
        style={styles.row}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.highlight && (
            <Ionicons name="star" color={colors.primary} size={18} style={{ marginRight: 6 }} />
          )}
          <StyledText>{item.name}</StyledText>
        </View>
        <StyledText color={colors.primary}>{thousandsSystem(total)}</StyledText>
      </StyledButton>
      <CardInformation
        visible={showInformation}
        inventory={item}
        onClose={() => setShowInformation(false)}
        onPressDelete={removeData}
        onPressEdit={() => {
          navigation.navigate("InventoryRoutes", {
            screen: "CreateInventory",
            params: { inventory: item },
          });
        }}
      />
    </>
  );
};

const Inventory: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);
  const portions = useAppSelector((state) => state.portions);
  const inventories = useAppSelector((state) => state.inventories);

  const quantities = useMovementsMap();

  const [data, setData] = useState<InventoryType[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => navigation.navigate("InventoryRoutes", { screen: "CreateInventory" })}
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setData([...inventories].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0)));
  }, [inventories]);

  const total = useMemo(() => {
    return inventories.reduce(
      (acc, { id }) => acc + calculateInventoryTotal(id, portions, stocks, quantities),
      0,
    );
  }, [inventories, portions, stocks, quantities]);

  const renderItem: ListRenderItem<InventoryType> = useCallback(
    ({ item }) => <Card item={item} />,
    [],
  );

  return (
    <Layout>
      {!inventories.length ? (
        <StyledText color={colors.primary}>NO HAY INVENTARIOS REGISTRADOS</StyledText>
      ) : (
        <>
          <FlatList
            data={data}
            contentContainerStyle={{ flexGrow: 1 }}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
          <StyledText>
            Total inventario:{" "}
            <StyledText color={colors.primary}>{thousandsSystem(total)}</StyledText>
          </StyledText>
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: { marginHorizontal: 4 },
});

export default Inventory;
