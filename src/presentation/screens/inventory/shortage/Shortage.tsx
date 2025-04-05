import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppSelector } from "application/store/hook";
import { thousandsSystem } from "shared/utils";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import type { Stock as StockType } from "domain/entities/data/inventories";
import { useMovementsMap } from "../hooks/useMovementsMap";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Table from "presentation/components/layout/Table";
import { calculatePortion } from "../stock/Stock";

type NavigationProps = StackNavigationProp<RootApp>;

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

const Shortage: React.FC<StockProps> = ({ inventoryID, visualization }) => {
  const stocks = useAppSelector((state) => state.stocks);

  const movementsMap = useMovementsMap();

  const found = useMemo(() => {
    return stocks.filter((stock) => {
      const quantity = movementsMap.get(stock.id) || 0;
      return stock.inventoryID === inventoryID && quantity < stock.reorder;
    });
  }, [stocks]);

  const [data, setData] = useState<StockType[]>([]);
  const [search, setSearch] = useState<string>("");

  const quantities = useMovementsMap();

  const total = useMemo(() => {
    return data.reduce((acc, stock) => {
      const quantity = quantities.get(stock.id) || 0;
      const total = quantity * stock.currentValue;
      return acc + total;
    }, 0);
  }, [data, quantities]);

  useEffect(() => {
    let filtered = found;

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm) ||
          s.reference.toLowerCase().includes(searchTerm) ||
          s.unit.toLowerCase().includes(searchTerm) ||
          s.brand.toLowerCase().includes(searchTerm),
      );
    }

    setData(filtered);
  }, [search, stocks]);

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
            <StyledText color={colors.primary}>
              NO HAY ÍTEMS POR DEBAJO DEL PUNTO DE REORDEN
            </StyledText>
          )}
          {!!found.length && (
            <>
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
          <StyledText style={{ marginVertical: 10 }}>
            Valor total: <StyledText color={colors.primary}>{thousandsSystem(total)}</StyledText>
          </StyledText>
        )}
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
  evenly: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  movement: {
    width: "auto",
    marginVertical: 0,
    paddingHorizontal: 25,
  },
});

export default Shortage;
