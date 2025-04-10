import React, { useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import { Economy as EconomyType, Order } from "domain/entities/data";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { thousandsSystem } from "shared/utils";
import { selectEgress, selectIncome } from "application/selectors/economies.selectors";
import { Type as EconomyEnums } from "domain/enums/data/economy/economy.enums";
import FullFilterDate, {
  DateType,
  filterByDate,
  resetDate,
} from "presentation/components/layout/FullFilterDate";
import { selectCompletedOrders, selectCompletedSales } from "application/selectors";
import moment from "moment";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";

const Tab = createMaterialTopTabNavigator();

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ economy: EconomyType; detail: boolean }> = ({ economy, detail }) => {
  const { colors } = useTheme();

  const path = useMemo(
    () =>
      [economy.type, economy.category.name, economy.subcategory?.name].filter(Boolean).join("/"),
    [economy],
  );

  const navigation = useNavigation<NavigationProps>();

  return (
    <StyledButton
      style={[styles.row, { opacity: !economy.isSpecial ? 1 : 0.6 }]}
      onPress={() => {
        navigation.navigate("EconomyRoutes", {
          screen: "EconomyInformation",
          params: { economy },
        });
      }}
      onLongPress={() => {
        if (!economy.isSpecial) {
          navigation.navigate("EconomyRoutes", {
            screen: "CreateEconomy",
            params: { economy, type: economy.type },
          });
        }
      }}
    >
      <StyledText ellipsizeMode="tail" numberOfLines={1}>
        {detail ? path : economy.category.name}
      </StyledText>
      <StyledText color={economy.type === EconomyEnums.Income ? colors.primary : "#f71010"}>
        ({thousandsSystem(economy.quantity)}) {thousandsSystem(economy.value)}
      </StyledText>
    </StyledButton>
  );
};

// Función para convertir una orden a EconomyType
const convertOrderToEconomy = (order: Order): EconomyType => ({
  id: order.id,
  supplier: null,
  type: EconomyEnums.Income, // Las órdenes siempre son ingresos
  category: { id: "order", name: "Venta" },
  subcategory: null,
  value: order.total,
  quantity: order.selection.reduce((a, b) => a + b.quantity, 0),
  unit: "",
  description: `Orden #${order.order}`,
  date: order.creationDate,
  reference: order.invoice,
  brand: "",
  creationDate: order.creationDate,
  modificationDate: order.modificationDate,
  operative: true,
  isSpecial: true,
});

const combineData = (economies: EconomyType[], orders: Order[]): EconomyType[] => {
  // Convertir órdenes al formato EconomyType
  const convertedOrders = orders.map(convertOrderToEconomy);

  // Combinar economies, convertedOrders
  const combinedData = economies.concat(convertedOrders);

  // Ordenar por fecha de creación (de más reciente a más antiguo)
  combinedData.sort((a, b) => moment(b.creationDate).diff(moment(a.creationDate)));

  return combinedData;
};

type EconomyScreenProps = {
  economies: EconomyType[];
  orders?: Order[];
};

const EconomyScreen: React.FC<EconomyScreenProps> = ({ economies, orders = [] }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  const [isDetail, setDetail] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const [date, setDate] = useState<DateType>(resetDate);

  const sorted = useMemo(() => combineData(economies, orders), [orders, economies]);

  const data: EconomyType[] = useMemo(() => {
    const filteredByDate = filterByDate<EconomyType>(sorted, date);
    if (!search) return filteredByDate;
    const searchTerm = search.toLowerCase();
    const filteredBySearch = filteredByDate.filter(
      (d) =>
        d.category.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm),
    );
    return filteredBySearch;
  }, [sorted, search, date]);

  const getValue = (type: EconomyEnums) =>
    data.filter((d) => d.type === type).reduce((a, b) => a + b.value, 0);

  const icome = useMemo(() => getValue(EconomyEnums.Income), [data]);
  const egress = useMemo(() => getValue(EconomyEnums.Egress), [data]);
  const totalValue = useMemo(() => data.reduce((a, b) => a + b.value, 0), [data]);

  return (
    <Layout style={{ padding: 0 }}>
      {!sorted.length ? (
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
              <StyledText color={colors.primary}>NO HAY ORDENES PARA LA BÚSQUEDA</StyledText>
            )}
            <FlatList
              data={data}
              style={{ flexGrow: 1 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Card economy={item} detail={isDetail} />}
            />
            <View style={styles.features}>
              <StyledButton
                style={{ marginRight: 5, width: "auto" }}
                backgroundColor={isDetail ? colors.primary : colors.card}
                onPress={() => setDetail(!isDetail)}
              >
                <StyledText smallParagraph color={isDetail ? "#FFFFFF" : colors.text}>
                  Detalles
                </StyledText>
              </StyledButton>
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

  const orders = useAppSelector(selectCompletedOrders);
  const sales = useAppSelector(selectCompletedSales);

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
      <Tab.Screen name="TODO">
        {() => <EconomyScreen economies={economies} orders={[...sales, ...orders]} />}
      </Tab.Screen>
      <Tab.Screen name="INGRESO">
        {() => <EconomyScreen economies={income} orders={[...sales, ...orders]} />}
      </Tab.Screen>
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
