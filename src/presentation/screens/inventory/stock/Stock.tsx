import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppSelector } from "application/store/hook";
import { thousandsSystem } from "shared/utils";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import type { Stock as StockType } from "domain/entities/data/inventories";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import { Type } from "domain/enums/data/inventory/movement.enums";

type NavigationProps = StackNavigationProp<RootApp>;

type CardProps = {
  stock: StockType;
  onPress: (stockID: StockType) => void;
  onLongPress: (stock: StockType) => void;
};

const Card: React.FC<CardProps> = ({ stock, onPress, onLongPress }) => {
  const { colors } = useTheme();

  const coin = useAppSelector((state) => state.coin);
  const quantity = stock.movements.reduce((a, b) => a + b.quantity, 0);

  return (
    <StyledButton
      style={styles.row}
      onPress={() => onPress(stock)}
      onLongPress={() => onLongPress(stock)}
    >
      <View>
        <StyledText>
          {stock.name} {stock.unit && `(${stock.unit})`}
        </StyledText>
        <StyledText>
          Total: {stock.currentValue * quantity} {coin}
        </StyledText>
      </View>
      <StyledText right color={quantity >= stock.reorder ? colors.text : colors.primary}>
        {thousandsSystem(quantity)}/{thousandsSystem(stock.reorder)}
      </StyledText>
    </StyledButton>
  );
};

type StockProps = {
  inventoryID: string;
};

const Stock: React.FC<StockProps> = ({ inventoryID }) => {
  const stocks = useAppSelector((state) => state.stocks);

  const found = useMemo(() => stocks.filter((s) => s.inventoryID === inventoryID), [stocks]);

  const [data, setData] = useState<StockType[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!search) return setData(found);
    const searchTerm = search.toLowerCase();
    const filtered = found.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.reference.toLowerCase().includes(searchTerm) ||
        s.unit.toLowerCase().includes(searchTerm) ||
        s.brand.toLowerCase().includes(searchTerm),
    );
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
        <View style={{ flexGrow: 1 }}>
          {!found.length && (
            <StyledText color={colors.primary}>NO HAY ÍTEMS REGISTRADOS</StyledText>
          )}
          {!!found.length && (
            <>
              <View style={[styles.evenly, { marginBottom: 5 }]}>
                <StyledButton
                  style={styles.movement}
                  onPress={() =>
                    navigation.navigate("InventoryRoutes", {
                      screen: "CreateMovement",
                      params: { inventoryID, type: Type.Output },
                    })
                  }
                >
                  <StyledText>Registrar salida</StyledText>
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
                  <StyledText color="#FFFFFF">Registrar entrada</StyledText>
                </StyledButton>
              </View>
              {!data.length && (
                <StyledText color={colors.primary} style={{ marginVertical: 10 }}>
                  NO HAY ÍTEMS PARA LA BUSQUEDA
                </StyledText>
              )}
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
            </>
          )}
        </View>
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
        {/* <StyledButton onPress={() => {}}>
          <StyledText center>Categorías</StyledText>
        </StyledButton> */}
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

export default Stock;
