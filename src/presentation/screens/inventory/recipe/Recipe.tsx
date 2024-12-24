import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import type { Inventory, Recipe as RecipeType } from "domain/entities/data/inventories";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";

type NavigationProps = StackNavigationProp<RootApp>;

type CardProps = {
  recipe: RecipeType;
  onPress: (recipe: RecipeType) => void;
  onLongPress: (recipe: RecipeType) => void;
};

const Card: React.FC<CardProps> = ({ recipe, onPress, onLongPress }) => {
  const { colors } = useTheme();

  const coin = useAppSelector((state) => state.coin);
  const stocks = useAppSelector((state) => state.stocks);

  const cost = recipe.ingredients.reduce((a, b) => {
    const { currentValue = 0 } = stocks.find((s) => s.id === b.id) ?? {};
    return a + currentValue * b.quantity;
  }, 0);

  return (
    <StyledButton
      style={styles.row}
      onPress={() => onPress(recipe)}
      onLongPress={() => onLongPress(recipe)}
    >
      <View>
        <StyledText>{recipe.name}</StyledText>
        <StyledText>{thousandsSystem(recipe.ingredients.length)} Ingredientes</StyledText>
      </View>
      <View>
        <StyledText color={colors.primary} right>
          {thousandsSystem(recipe.value)} {coin}
        </StyledText>
        <StyledText color="#f71010" right>
          {thousandsSystem(cost)} {coin}
        </StyledText>
      </View>
    </StyledButton>
  );
};

const GET_TAB_NAME = {
  [Visible.Both]: "RECETAS/PAQUETES",
  [Visible.Restaurant]: "RECETAS",
  [Visible.Store]: "PAQUETES",
};

type RecipeProps = {
  inventory: Inventory;
};

const Recipe: React.FC<RecipeProps> = ({ inventory }) => {
  const recipes = useAppSelector((state) => state.recipes);
  const stocks = useAppSelector((state) => state.stocks);

  const found = useMemo(() => recipes.filter((s) => s.inventoryID === inventory.id), [recipes]);

  const [data, setData] = useState<RecipeType[]>(recipes);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!search) return setData(found);
    const searchTerm = search.toLowerCase();
    const filtered = found.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm),
    );
    setData(filtered);
  }, [search, recipes]);

  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  const NAME = GET_TAB_NAME[inventory.visible];

  return (
    <Layout style={{ padding: 0 }}>
      {!!found.length && (
        <StyledInput
          placeholder="Busca por nombre, descripción."
          stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
          stylesInput={{ paddingVertical: 15 }}
          onChangeText={setSearch}
          left={() => <Ionicons name="search" size={25} color={colors.text} />}
        />
      )}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flex: 1 }}>
        <View style={{ flexGrow: 1 }}>
          {!found.length && (
            <StyledText color={colors.primary}>NO HAY {NAME} REGISTRADOS</StyledText>
          )}
          {!!found.length && (
            <>
              {!data.length && (
                <StyledText color={colors.primary}>NO HAY {NAME} PARA LA BUSQUEDA</StyledText>
              )}
              <FlatList
                data={data}
                style={{ flexGrow: 1 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card
                    recipe={item}
                    onPress={(recipe) =>
                      navigation.navigate("InventoryRoutes", {
                        screen: "RecipeInformation",
                        params: { recipe },
                      })
                    }
                    onLongPress={(recipe) =>
                      navigation.navigate("InventoryRoutes", {
                        screen: "CreateRecipe",
                        params: { recipe, inventory },
                      })
                    }
                  />
                )}
              />
            </>
          )}
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          onPress={() => {
            const found = stocks.filter((s) => s.inventoryID === inventory.id);
            if (!found.length)
              return Alert.alert("OOPS!", `No hay stocks registrados para crear ${NAME}`, [], {
                cancelable: true,
              });

            navigation.navigate("InventoryRoutes", {
              screen: "CreateRecipe",
              params: { inventory },
            });
          }}
        >
          <StyledText center color="#FFFFFF">
            Crear {NAME}
          </StyledText>
        </StyledButton>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default Recipe;
