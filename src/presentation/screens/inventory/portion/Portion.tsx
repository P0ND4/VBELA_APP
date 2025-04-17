import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import type { Portion as PortionType, Stock } from "domain/entities/data/inventories";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { thousandsSystem } from "shared/utils";
import { Group, GroupSubCategory } from "domain/entities/data";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import Table from "presentation/components/layout/Table";
import GroupSection from "presentation/components/layout/GroupSection";
import { Type } from "domain/enums/data/inventory/portion.enums";
import FullFilterDate, {
  DateType,
  filterByDate,
  Type as TypeEnums,
} from "presentation/components/layout/FullFilterDate";

type NavigationProps = StackNavigationProp<RootApp>;

// Helper function to calculate the cost of a portion
const calculateCost = (portion: PortionType, stocks: Stock[]): number => {
  return portion.ingredients.reduce((total, ingredient) => {
    const stock = stocks.find((s) => s.id === ingredient.id);
    return total + (stock?.currentValue || 0) * ingredient.quantity;
  }, 0);
};

// Card component to display portion information
const Card: React.FC<{ portion: PortionType; onPress: () => void; onLongPress: () => void }> = ({
  portion,
  onPress,
  onLongPress,
}) => {
  const stocks = useAppSelector((state) => state.stocks);

  const cost = useMemo(() => calculateCost(portion, stocks), [portion, stocks]);

  return (
    <StyledButton style={styles.row} onPress={onPress} onLongPress={onLongPress}>
      <View>
        <StyledText>{portion.name}</StyledText>
        <StyledText verySmall>{thousandsSystem(portion.quantity)} Porciones</StyledText>
      </View>
      <StyledText color="#f71010" right verySmall>
        {thousandsSystem(cost)}
      </StyledText>
    </StyledButton>
  );
};

type PortionProps = {
  inventoryID: string;
  visualization: "block" | "table";
};

// Main Portion component
const Portion: React.FC<PortionProps> = ({ inventoryID, visualization }) => {
  const portions = useAppSelector((state) => state.portions);
  const stocks = useAppSelector((state) => state.stocks);
  const portionGroup = useAppSelector((state) => state.portionGroup);

  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProps>();

  const found = useMemo(
    () => portions.filter((recipe) => recipe.inventoryID === inventoryID),
    [portions, inventoryID],
  );

  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PortionType[]>(found);

  const [categorySelected, setCategorySelected] = useState<Group | null>(null);
  const [subcategorySelected, setSubcategorySelected] = useState<GroupSubCategory | null>(null);

  const [date, setDate] = useState<DateType>({
    type: TypeEnums.All,
    start: null,
    end: null,
    id: "All",
  });

  useEffect(() => {
    setCategorySelected(null);
    setSubcategorySelected(null);
  }, [portionGroup]);

  useEffect(() => {
    let filteredByDate = filterByDate<PortionType>(found, date);
    filteredByDate = filteredByDate.sort((a, b) => a.name.localeCompare(b.name));

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredByDate = filteredByDate.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm),
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
  }, [search, found, categorySelected, subcategorySelected, date]);

  useEffect(() => {
    const data = portionGroup.filter((group) => group.ownerID === inventoryID);
    setGroups(data);
  }, [portionGroup, inventoryID]);

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
            <StyledText color={colors.primary}>NO HAY PORCIONES REGISTRADAS</StyledText>
          )}
          {!!found.length && (
            <>
              <View style={styles.row}>
                <StyledButton
                  style={styles.portion}
                  onPress={() => {
                    navigation.navigate("InventoryRoutes", {
                      screen: "CreateActivity",
                      params: { type: Type.Output, inventoryID },
                    });
                  }}
                >
                  <StyledText center>Registrar salida</StyledText>
                </StyledButton>
                <StyledButton
                  style={styles.portion}
                  backgroundColor={colors.primary}
                  onPress={() => {
                    navigation.navigate("InventoryRoutes", {
                      screen: "CreateActivity",
                      params: { type: Type.Entry, inventoryID },
                    });
                  }}
                >
                  <StyledText color="#FFFFFF" center>
                    Registrar entrada
                  </StyledText>
                </StyledButton>
              </View>
              <FullFilterDate date={date} setDate={setDate} style={{ paddingVertical: 5 }} />
              {!data.length && (
                <StyledText color={colors.primary} style={{ marginVertical: 10 }}>
                  NO HAY PORCIONES PARA LA BUSQUEDA
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
                          portion={item}
                          onPress={() =>
                            navigation.navigate("InventoryRoutes", {
                              screen: "PortionInformation",
                              params: { portion: item },
                            })
                          }
                          onLongPress={() =>
                            navigation.navigate("InventoryRoutes", {
                              screen: "CreatePortion",
                              params: { portion: item, inventoryID },
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
                      <Table.Header data={["Nombre", "Porción"]}>
                        {data.map((data) => (
                          <Table.Body
                            key={data.id}
                            onPressCompleteData={true}
                            data={[data.name, thousandsSystem(data.quantity)]}
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
            onPressCreateGroup={(group) => {
              navigation.navigate("InventoryRoutes", {
                screen: "CreatePortionGroup",
                params: { group, inventoryID },
              });
            }}
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
        <StyledButton
          backgroundColor={colors.primary}
          onPress={() => {
            const found = stocks.filter((s) => s.inventoryID === inventoryID);
            if (!found.length) {
              Alert.alert("OOPS!", `No hay stocks registrados para crear porciones`, [], {
                cancelable: true,
              });
              return;
            }

            navigation.navigate("InventoryRoutes", {
              screen: "CreatePortion",
              params: { inventoryID },
            });
          }}
        >
          <StyledText center color="#FFFFFF">
            Crear porción
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
  portion: {
    width: "auto",
    marginVertical: 0,
    paddingHorizontal: 25,
  },
});

export default Portion;
