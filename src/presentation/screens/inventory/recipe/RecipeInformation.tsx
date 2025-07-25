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
import { Portion, Recipe, RecipeIngredients, Stock } from "domain/entities/data/inventories";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledTextInformation from "presentation/components/text/StyledTextInformation";
import { batch } from "react-redux";
import { remove } from "application/slice/inventories/recipes.slice";
import { removeRecipe as removeRecipeProduct } from "application/slice/stores/products.slice";
import { removeRecipe as removeRecipeMenu } from "application/slice/restaurants/menu.slice";
import apiClient from "infrastructure/api/server";
import { Type } from "domain/enums/data/inventory/ingredient.enums";
import { useRecipeCost } from "../hooks/useRecipeCost";
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

const IngredientCard: React.FC<{ ingredient: RecipeIngredients }> = ({ ingredient }) => {
  const { colors } = useTheme();

  const portions = useAppSelector((state) => state.portions);
  const stocks = useAppSelector((state) => state.stocks);

  const [found, setFound] = useState<{ name: string; currentValue?: number } | null>(null);

  const portionsMap = useMemo(() => new Map(portions.map((p) => [p.id, p])), [portions]);
  const stocksMap = useMemo(() => new Map(stocks.map((s) => [s.id, s])), [stocks]);

  const calculatePortionCurrentValue = (
    portion: Portion,
    stocksMap: Map<string, Stock>,
  ): number => {
    return portion.ingredients.reduce((total, ingredient) => {
      const stock = stocksMap.get(ingredient.id);
      if (!stock) return total;
      return total + stock.currentValue * ingredient.quantity;
    }, 0);
  };

  useEffect(() => {
    let found = null;
    if (ingredient.type === Type.Portion) {
      const portion = portionsMap.get(ingredient.id);
      if (portion) {
        const currentValue = calculatePortionCurrentValue(portion, stocksMap);
        found = { ...portion, currentValue };
      }
    } else {
      const stock = stocksMap.get(ingredient.id);
      if (stock) found = stock;
    }
    setFound(found ?? null);
  }, [ingredient, stocksMap, portionsMap]);
  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText color={colors.primary}>
        {thousandsSystem(ingredient.quantity)}x{" "}
        <StyledText>{found ? `${found.name}` : "Eliminado"}</StyledText>
      </StyledText>
      <StyledText>{thousandsSystem((found?.currentValue ?? 1) * ingredient.quantity)}</StyledText>
    </View>
  );
};

type IngredientsModalProps = {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
};

const IngredientsModal: React.FC<IngredientsModalProps> = ({ recipe, visible, onClose }) => {
  const cost = useRecipeCost(recipe.ingredients);

  return (
    <ScreenModal title="Ingredientes" visible={visible} onClose={onClose}>
      <FlatList
        data={recipe.ingredients}
        style={{ flexGrow: 1 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IngredientCard ingredient={item} />}
      />
      <View style={{ padding: 20 }}>
        <StyledTextInformation
          label="Valor de la receta"
          value={`${thousandsSystem(recipe.value)}`}
        />
        <StyledTextInformation
          label="Costo del stock"
          value={`${thousandsSystem(cost)}`}
          valueColor="#f71010"
        />
      </View>
    </ScreenModal>
  );
};

type CreateStockProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"RecipeInformation">;
};

const RecipeInformation: React.FC<CreateStockProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const recipes = useAppSelector((state) => state.recipes);

  const recipe = route.params.recipe;

  const [data, setData] = useState<Recipe>(recipe);
  const [ingredientsModal, setIngredientsModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `Información: ${data.name}` });
  }, [data]);

  useEffect(() => {
    const found = recipes.find((s) => s.id === recipe.id);
    if (!found) navigation.pop();
    else setData(found);
  }, [recipes, recipe]);

  const removeData = async () => {
    batch(() => {
      dispatch(remove({ id: recipe.id }));
      dispatch(removeRecipeProduct({ ids: [recipe.id] }));
      dispatch(removeRecipeMenu({ ids: [recipe.id] }));
    });

    await apiClient({
      url: endpoints.recipe.delete(recipe.id),
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
          <Card name="Visible" value={data.visible ? "Si" : "No"} />
          <Card name="Valor" value={thousandsSystem(data.value)} />
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
        recipe={data}
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

export default RecipeInformation;
