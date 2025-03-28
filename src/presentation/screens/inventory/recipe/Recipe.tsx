import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import type { Inventory, Recipe as RecipeType, Stock } from "domain/entities/data/inventories";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { thousandsSystem } from "shared/utils";
import { Group, GroupSubCategory } from "domain/entities/data";
import { useMovementsMap } from "../hooks/useMovementsMap";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import Table from "presentation/components/layout/Table";
import GroupSection from "presentation/components/layout/GroupSection";

type NavigationProps = StackNavigationProp<RootApp>;

// Helper function to calculate the cost of a recipe
const calculateCost = (recipe: RecipeType, stocks: Stock[]): number => {
  return recipe.ingredients.reduce((total, ingredient) => {
    const stock = stocks.find((s) => s.id === ingredient.id);
    return total + (stock?.currentValue || 0) * ingredient.quantity;
  }, 0);
};

// Card component to display recipe information
const Card: React.FC<{ recipe: RecipeType; onPress: () => void; onLongPress: () => void }> = ({
  recipe,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();
  const stocks = useAppSelector((state) => state.stocks);

  const movementsMap = useMovementsMap();

  const portions = useMemo(() => {
    const minPortions = recipe.ingredients.map((ingredient) => {
      const stockQuantity = movementsMap.get(ingredient.id) || 0;
      return Math.floor(stockQuantity / ingredient.quantity);
    });

    return Math.min(...minPortions);
  }, [recipe, stocks]);
  const cost = useMemo(() => calculateCost(recipe, stocks), [recipe, stocks]);

  return (
    <StyledButton style={styles.row} onPress={onPress} onLongPress={onLongPress}>
      <View>
        <StyledText>{recipe.name}</StyledText>
        <StyledText verySmall>{thousandsSystem(portions)} Porciones</StyledText>
      </View>
      <View>
        <StyledText color={colors.primary} right bold>
          {thousandsSystem(recipe.value)}
        </StyledText>
        <StyledText color="#f71010" right verySmall>
          {thousandsSystem(cost)}
        </StyledText>
      </View>
    </StyledButton>
  );
};

// Mapping for visibility types
const GET_TAB_NAME: { [key in Visible]: string } = {
  [Visible.Both]: "RECETAS/PAQUETES",
  [Visible.Restaurant]: "RECETAS",
  [Visible.Store]: "PAQUETES",
  [Visible.None]: "SIN VISIBILIDAD",
};

type RecipeProps = {
  inventory: Inventory;
  visualization: "block" | "table";
};

// Main Recipe component
const Recipe: React.FC<RecipeProps> = ({ inventory, visualization }) => {
  const recipes = useAppSelector((state) => state.recipes);
  const stocks = useAppSelector((state) => state.stocks);
  const recipeGroup = useAppSelector((state) => state.recipeGroup);

  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProps>();

  const found = useMemo(
    () => recipes.filter((recipe) => recipe.inventoryID === inventory.id),
    [recipes, inventory],
  );

  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<RecipeType[]>(found);

  const [categorySelected, setCategorySelected] = useState<Group | null>(null);
  const [subcategorySelected, setSubcategorySelected] = useState<GroupSubCategory | null>(null);

  useEffect(() => {
    setCategorySelected(null);
    setSubcategorySelected(null);
  }, [recipeGroup]);

  useEffect(() => {
    let filtered = found;

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm),
      );
    }

    if (categorySelected)
      filtered = filtered.filter((stock) => stock.categories.includes(categorySelected.id));

    if (subcategorySelected)
      filtered = filtered.filter((stock) =>
        stock.subcategories.some((s) => s.subcategory === subcategorySelected.id),
      );

    setData(filtered);
  }, [search, found, categorySelected, subcategorySelected]);

  useEffect(() => {
    const data = recipeGroup.filter((group) => group.ownerID === inventory.id);
    setGroups(data);
  }, [recipeGroup, inventory.id]);

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
        <View style={{ flex: 1 }}>
          {!found.length && (
            <StyledText color={colors.primary}>NO HAY {NAME} REGISTRADOS</StyledText>
          )}
          {!!found.length && (
            <>
              <GroupSection
                groups={groups}
                group={categorySelected}
                subGroup={subcategorySelected}
                onPressCreateGroup={(group) =>
                  navigation.navigate("InventoryRoutes", {
                    screen: "CreateRecipeGroup",
                    params: { group, inventoryID: inventory.id },
                  })
                }
                onPressGroup={(item) => {
                  setSubcategorySelected(null);
                  if (categorySelected?.id === item.id) setCategorySelected(null);
                  else setCategorySelected(item);
                }}
                onPressSubGroup={(item) => {
                  if (subcategorySelected?.id === item.id) setSubcategorySelected(null);
                  else setSubcategorySelected(item);
                }}
              />
              {!data.length && (
                <StyledText color={colors.primary}>NO HAY {NAME} PARA LA BUSQUEDA</StyledText>
              )}
              {!!data.length && (
                <>
                  {visualization === "block" ? (
                    <FlatList
                      data={data}
                      style={{ flexGrow: 1 }}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <Card
                          recipe={item}
                          onPress={() =>
                            navigation.navigate("InventoryRoutes", {
                              screen: "RecipeInformation",
                              params: { recipe: item },
                            })
                          }
                          onLongPress={() =>
                            navigation.navigate("InventoryRoutes", {
                              screen: "CreateRecipe",
                              params: { recipe: item, inventory },
                            })
                          }
                        />
                      )}
                    />
                  ) : (
                    <Table
                      full
                      containerStyle={{ marginVertical: 4 }}
                      scrollHorizontalEnable={false}
                    >
                      <Table.Header data={["Receta", "Valor"]}>
                        {data.map((data) => (
                          <Table.Body
                            key={data.id}
                            data={[data.name, thousandsSystem(data.value)]}
                          />
                        ))}
                      </Table.Header>
                    </Table>
                  )}
                </>
              )}
            </>
          )}
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          onPress={() => {
            const found = stocks.filter((s) => s.inventoryID === inventory.id);
            if (!found.length) {
              Alert.alert("OOPS!", `No hay stocks registrados para crear ${NAME}`, [], {
                cancelable: true,
              });
              return;
            }

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
