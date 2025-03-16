import React, { useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import { Economy as EconomyType } from "domain/entities/data";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { thousandsSystem } from "shared/utils";
import { selectEgress, selectIncome } from "application/selectors/economies.selectors";
import { Type } from "domain/enums/data/economy/economy.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";

const Tab = createMaterialTopTabNavigator();

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ economy: EconomyType }> = ({ economy }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <StyledButton
      style={styles.row}
      onPress={() => {
        navigation.navigate("EconomyRoutes", {
          screen: "EconomyInformation",
          params: { economy },
        });
      }}
      onLongPress={() =>
        navigation.navigate("EconomyRoutes", {
          screen: "CreateEconomy",
          params: { economy, type: economy.type },
        })
      }
    >
      <View>
        <StyledText>
          {economy.name} {economy.unit && `(${economy.unit})`}
        </StyledText>
        <StyledText color={colors.text} verySmall>
          {economy.description.slice(0, 40)} {economy.description.length > 40 ? "..." : ""}
        </StyledText>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <StyledText bold>{thousandsSystem(economy.quantity)}</StyledText>
        <StyledText verySmall color={economy.type === Type.Income ? colors.primary : "#f71010"}>
          {thousandsSystem(economy.value * economy.quantity)}
        </StyledText>
      </View>
    </StyledButton>
  );
};

const EconomyScreen: React.FC<{ economies: EconomyType[] }> = ({ economies }) => {
  const { colors } = useTheme();

  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<EconomyType[]>([]);

  useEffect(() => {
    const sorted = [...economies].reverse();
    if (!search) return setData(sorted);
    const searchTerm = search.toLowerCase();
    const filtered = sorted.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm),
    );
    setData(filtered);
  }, [economies, search]);

  const totalValue = useMemo(() => data.reduce((a, b) => a + b.value * b.quantity, 0), [data]);

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
          <View style={{ flex: 1, padding: 20 }}>
            {!data.length && (
              <StyledText color={colors.primary}>NO HAY ORDENES PARA LA BÚSQUEDA</StyledText>
            )}
            <FlatList
              data={data}
              style={{ flexGrow: 1 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Card economy={item} />}
            />
          </View>
          <View style={[styles.footer, { backgroundColor: colors.card }]}>
            <StyledText>
              Ingreso/Egreso: <StyledText color={colors.primary}>{data.length}</StyledText>
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

  const economies = useAppSelector((state) => state.economies);
  const income = useAppSelector(selectIncome);
  const egress = useAppSelector(selectEgress);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={[styles.headerRightButton, { borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("EconomyRoutes", {
                screen: "CreateEconomy",
                params: { type: Type.Income },
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
                params: { type: Type.Egress },
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
      <Tab.Screen name="TODO">{() => <EconomyScreen economies={economies} />}</Tab.Screen>
      <Tab.Screen name="INGRESO">{() => <EconomyScreen economies={income} />}</Tab.Screen>
      <Tab.Screen name="EGRESO">{() => <EconomyScreen economies={egress} />}</Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 20,
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
    borderRadius: 4,
  },
});

export default Economy;
