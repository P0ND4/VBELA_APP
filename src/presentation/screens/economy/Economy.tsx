import React, { useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useNavigation, useTheme } from "@react-navigation/native";
import { Economy as EconomyType } from "domain/entities/data";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { thousandsSystem } from "shared/utils";
import { Type as EconomyEnums } from "domain/enums/data/economy/economy.enums";
import FullFilterDate, {
  DateType,
  filterByDate,
  resetDate,
} from "presentation/components/layout/FullFilterDate";
import { GroupedEconomy, useEconomyData } from "./hooks/useEconomyData";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";

const Tab = createMaterialTopTabNavigator();

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ group: GroupedEconomy }> = ({ group }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <StyledButton
      style={styles.row}
      onPress={() => {
        navigation.navigate("EconomyRoutes", {
          screen: "GroupInformation",
          params: { economies: group.economies },
        });
      }}
    >
      <StyledText ellipsizeMode="tail" numberOfLines={1}>
        {group.key}
      </StyledText>
      <StyledText color={group.value < 0 ? "#f71010" : colors.primary}>
        ({thousandsSystem(group.quantity)}) {thousandsSystem(group.value)}
      </StyledText>
    </StyledButton>
  );
};

const getGroupKey = (economy: EconomyType): string => {
  const { name: categoryName } = economy.category;
  const { name: subcategoryName } = economy.subcategory ?? {};

  const unit = economy.unit ? `/${economy.unit}` : "";
  if (categoryName && subcategoryName)
    return `${categoryName.toUpperCase()}/${subcategoryName.toUpperCase()}${unit}`;
  if (categoryName) return economy.category.name.toUpperCase();
  return "SIN GRUPO";
};

const groupEconomies = (economies: EconomyType[]): GroupedEconomy[] => {
  const groups = new Map<string, GroupedEconomy>();

  for (const eco of economies) {
    const key = getGroupKey(eco);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        quantity: 0,
        economies: [],
        unit: eco.unit,
        value: 0,
      });
    }

    const group = groups.get(key)!;
    group.economies.push(eco);
    group.quantity += eco.quantity;
    group.value += eco.value;
  }

  return Array.from(groups.values());
};

const EconomyScreen: React.FC<{ economies: EconomyType[] }> = ({ economies }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  const [search, setSearch] = useState<string>("");

  const [date, setDate] = useState<DateType>(resetDate);

  const data: EconomyType[] = useMemo(() => {
    const filteredByDate = filterByDate<EconomyType>(economies, date);
    if (!search) return filteredByDate;
    const searchTerm = search.toLowerCase();
    const filteredBySearch = filteredByDate.filter(
      (d) =>
        d.category.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm),
    );
    return filteredBySearch;
  }, [economies, search, date]);

  const getValue = (type: EconomyEnums) =>
    data.filter((d) => d.type === type).reduce((a, b) => a + b.value, 0);

  const icome = useMemo(() => getValue(EconomyEnums.Income), [data]);
  const egress = useMemo(() => getValue(EconomyEnums.Egress), [data]);
  const totalValue = useMemo(() => data.reduce((a, b) => a + b.value, 0), [data]);

  const groupedData = useMemo(() => groupEconomies(data), [data]);

  return (
    <Layout style={{ padding: 0 }}>
      {!economies.length ? (
        <StyledText color={colors.primary} style={{ padding: 20 }}>
          NO HAY INFORMACIÓN EN ESTE ESTADO
        </StyledText>
      ) : (
        <>
          <StyledInput
            placeholder="Búsqueda por nombre"
            stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
            stylesInput={{ paddingVertical: 15 }}
            value={search}
            onChangeText={setSearch}
            left={() => <Ionicons name="search" size={25} color={colors.text} />}
          />
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <FullFilterDate date={date} setDate={setDate} style={{ paddingVertical: 10 }} />
            {!data.length && (
              <StyledText color={colors.primary}>NO HAY INFORMACIÓN PARA LA BÚSQUEDA</StyledText>
            )}
            <FlatList
              data={groupedData}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => <Card group={item} />}
            />
            <View style={styles.features}>
              <StyledButton
                onPress={() => navigation.navigate("SettingRoutes", { screen: "EconomicGroup" })}
                auto
                backgroundColor={colors.primary}
              >
                <StyledText verySmall color="#FFFFFF">
                  Configuración
                </StyledText>
              </StyledButton>
            </View>
          </View>
          <View style={{ backgroundColor: colors.card, padding: 20 }}>
            <StyledText>
              Ingreso: <StyledText color={colors.primary}>{thousandsSystem(icome)}</StyledText>
            </StyledText>
            <StyledText>
              Egreso: <StyledText color="#f71010">{thousandsSystem(egress)}</StyledText>
            </StyledText>
            <StyledText>
              Valor total:{" "}
              <StyledText color={totalValue >= 0 ? colors.primary : "#f71010"}>
                {thousandsSystem(totalValue)}
              </StyledText>
            </StyledText>
          </View>
        </>
      )}
    </Layout>
  );
};

const Economy: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();
  const { all, income, egress } = useEconomyData();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={[styles.headerRightButton, { borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("EconomyRoutes", {
                screen: "CreateEconomy",
                params: { type: EconomyEnums.Income },
              })
            }
          >
            <Ionicons name="add" color={colors.primary} size={20} />
            <StyledText smallParagraph>Ingreso</StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerRightButton, { borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("EconomyRoutes", {
                screen: "CreateEconomy",
                params: { type: EconomyEnums.Egress },
              })
            }
          >
            <Ionicons name="add" color={colors.primary} size={20} />
            <StyledText smallParagraph>Egreso</StyledText>
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen name="TODO">{() => <EconomyScreen economies={all} />}</Tab.Screen>
      <Tab.Screen name="INGRESO">{() => <EconomyScreen economies={income} />}</Tab.Screen>
      <Tab.Screen name="EGRESO">{() => <EconomyScreen economies={egress} />}</Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  features: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  economy: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    right: 5,
    top: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  headerRightContainer: {
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerRightButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginHorizontal: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default Economy;
