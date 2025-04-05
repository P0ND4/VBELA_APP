import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppSelector } from "application/store/hook";
import { thousandsSystem } from "shared/utils";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import type { Portion, Recipe, Stock as StockType } from "domain/entities/data/inventories";
import { Type } from "domain/enums/data/inventory/movement.enums";
import { Group, GroupSubCategory } from "domain/entities/data";
import { useMovementsMap } from "../hooks/useMovementsMap";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Table from "presentation/components/layout/Table";
import GroupSection from "presentation/components/layout/GroupSection";
import FullFilterDate, {
  DateType,
  filterByDate,
  Type as TypeEnums,
} from "presentation/components/layout/FullFilterDate";

type NavigationProps = StackNavigationProp<RootApp>;

export const calculatePortion = (
  { id: stockId, quantity: availableQuantity }: { id: string; quantity: number },
  recipes: Recipe[],
  portions: Portion[],
): number => {
  const portionsMap = new Map(portions.map((p) => [p.id, p]));

  const totalQuantityRequired = recipes.reduce((total, recipe) => {
    return (
      total +
      recipe.ingredients.reduce((recipeTotal, ingredient) => {
        if (ingredient.id === stockId) return recipeTotal + ingredient.quantity;

        const portion = portionsMap.get(ingredient.id);
        if (portion) {
          const portionIngredient = portion.ingredients.find((pIng) => pIng.id === stockId);
          if (portionIngredient) {
            return recipeTotal + portionIngredient.quantity * ingredient.quantity;
          }
        }

        return recipeTotal;
      }, 0)
    );
  }, 0);

  return totalQuantityRequired > 0 ? Math.floor(availableQuantity / totalQuantityRequired) : 0;
};

type CardProps = {
  stock: StockType;
  onPress: (stockID: StockType) => void;
  onLongPress: (stock: StockType) => void;
};

const Card: React.FC<CardProps> = ({ stock, onPress, onLongPress }) => {
  const { colors } = useTheme();

  const portions = useAppSelector((state) => state.portions);
  const recipes = useAppSelector((state) => state.recipes);

  const movementsMap = useMovementsMap();
  const quantity = useMemo(() => movementsMap.get(stock.id) || 0, [movementsMap, stock]);

  return (
    <StyledButton
      style={styles.row}
      onPress={() => onPress(stock)}
      onLongPress={() => onLongPress(stock)}
    >
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {quantity < stock.reorder && (
            <Ionicons name="warning-outline" size={22} color={colors.primary} />
          )}
          <StyledText>
            {stock.name} {stock.unit && `(${stock.unit})`}
          </StyledText>
        </View>
        <StyledText color={colors.text} verySmall>
          {thousandsSystem(calculatePortion({ id: stock.id, quantity }, recipes, portions))}{" "}
          Porciones
        </StyledText>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <StyledText bold color={quantity >= stock.reorder ? colors.text : colors.primary}>
          {thousandsSystem(quantity)}
        </StyledText>
        <StyledText verySmall color={colors.primary}>
          {thousandsSystem(stock.currentValue * quantity)}
        </StyledText>
      </View>
    </StyledButton>
  );
};

type StockProps = {
  inventoryID: string;
  visualization: "block" | "table";
};

const Stock: React.FC<StockProps> = ({ inventoryID, visualization }) => {
  const stocks = useAppSelector((state) => state.stocks);
  const stockGroup = useAppSelector((state) => state.stockGroup);

  const found = useMemo(() => stocks.filter((s) => s.inventoryID === inventoryID), [stocks]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [data, setData] = useState<StockType[]>([]);
  const [search, setSearch] = useState<string>("");

  const [categorySelected, setCategorySelected] = useState<Group | null>(null);
  const [subcategorySelected, setSubcategorySelected] = useState<GroupSubCategory | null>(null);

  const quantities = useMovementsMap();

  const [date, setDate] = useState<DateType>({
    type: TypeEnums.All,
    start: null,
    end: null,
    id: "All",
  });

  useEffect(() => {
    setCategorySelected(null);
    setSubcategorySelected(null);
  }, [stockGroup]);

  const total = useMemo(() => {
    return data.reduce((acc, stock) => {
      const quantity = quantities.get(stock.id) || 0;
      const total = quantity * stock.currentValue;
      return acc + total;
    }, 0);
  }, [data, quantities]);

  useEffect(() => {
    let filteredByDate = filterByDate<StockType>(found, date);

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredByDate = filteredByDate.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm) ||
          s.reference.toLowerCase().includes(searchTerm) ||
          s.unit.toLowerCase().includes(searchTerm) ||
          s.brand.toLowerCase().includes(searchTerm),
      );
    }

    if (categorySelected)
      filteredByDate = filteredByDate.filter((stock) =>
        stock.categories.includes(categorySelected.id),
      );

    if (subcategorySelected)
      filteredByDate = filteredByDate.filter((stock) =>
        stock.subcategories.some((s) => s.subcategory === subcategorySelected.id),
      );

    setData(filteredByDate);
  }, [search, stocks, categorySelected, subcategorySelected, date]);

  useEffect(() => {
    const data = stockGroup.filter((group) => group.ownerID === inventoryID);
    setGroups(data);
  }, [stockGroup, inventoryID]);

  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <Layout style={{ padding: 0 }}>
      {!!found.length && (
        <StyledInput
          placeholder="Busca por nombre, unidad, referencia, etc."
          stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
          stylesInput={{ paddingVertical: 15 }}
          onChangeText={setSearch}
          left={() => <Ionicons name="search" size={25} color={colors.text} />}
        />
      )}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flex: 1 }}>
        <View style={{ flex: 1 }}>
          {!found.length && (
            <StyledText color={colors.primary}>NO HAY ÍTEMS REGISTRADOS</StyledText>
          )}
          {!!found.length && (
            <>
              <View style={styles.row}>
                <StyledButton
                  style={styles.movement}
                  onPress={() =>
                    navigation.navigate("InventoryRoutes", {
                      screen: "CreateMovement",
                      params: { inventoryID, type: Type.Output },
                    })
                  }
                >
                  <StyledText center>Registrar salida</StyledText>
                </StyledButton>
                <StyledButton
                  style={styles.movement}
                  backgroundColor={colors.primary}
                  onPress={() =>
                    navigation.navigate("InventoryRoutes", {
                      screen: "CreateMovement",
                      params: { inventoryID, type: Type.Entry },
                    })
                  }
                >
                  <StyledText color="#FFFFFF" center>
                    Registrar entrada
                  </StyledText>
                </StyledButton>
              </View>
              <FullFilterDate date={date} setDate={setDate} style={{ paddingVertical: 5 }} />
              {!data.length && (
                <StyledText color={colors.primary} style={{ marginVertical: 10 }}>
                  NO HAY ÍTEMS PARA LA BUSQUEDA
                </StyledText>
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
                          stock={item}
                          onPress={(stock) =>
                            navigation.navigate("InventoryRoutes", {
                              screen: "StockInformation",
                              params: { stock },
                            })
                          }
                          onLongPress={(stock) =>
                            navigation.navigate("InventoryRoutes", {
                              screen: "CreateStock",
                              params: { inventoryID, stock },
                            })
                          }
                        />
                      )}
                    />
                  ) : (
                    <Table full containerStyle={{ marginVertical: 4 }}>
                      <Table.Header
                        data={[{ text: "Producto", style: { width: 150 } }, "Cantidad", "Valor"]}
                      >
                        {data.map((data) => (
                          <Table.Body
                            key={data.id}
                            onPressCompleteData={true}
                            data={[
                              { text: data.name, style: { width: 150 } },
                              thousandsSystem(quantities.get(data.id) || 0),
                              thousandsSystem((quantities.get(data.id) || 0) * data.currentValue),
                            ]}
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
        {!!found.length && (
          <GroupSection
            groups={groups}
            group={categorySelected}
            subGroup={subcategorySelected}
            onPressCreateGroup={(group) =>
              navigation.navigate("InventoryRoutes", {
                screen: "CreateStockGroup",
                params: { group, inventoryID },
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
        )}
        <StyledText style={{ marginVertical: 10 }}>
          Valor total: <StyledText color={colors.primary}>{thousandsSystem(total)}</StyledText>
        </StyledText>
        <StyledButton
          backgroundColor={colors.primary}
          onPress={() =>
            navigation.navigate("InventoryRoutes", {
              screen: "CreateStock",
              params: { inventoryID },
            })
          }
        >
          <StyledText center color="#FFFFFF">
            Crear ítem
          </StyledText>
        </StyledButton>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  movement: {
    width: "auto",
    marginVertical: 0,
    paddingHorizontal: 25,
  },
});

export default Stock;
