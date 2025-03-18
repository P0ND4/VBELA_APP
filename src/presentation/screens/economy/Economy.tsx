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
import { Type as EconomyEnums, Type } from "domain/enums/data/economy/economy.enums";
import FullFilterDate, {
  DateType,
  resetDate,
  Type as TypeEnums,
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
      [economy.type, economy.category.name, economy.unit, economy.reference, economy.brand]
        .filter(Boolean)
        .join("/"),
    [economy],
  );

  const navigation = useNavigation<NavigationProps>();

  return (
    <StyledButton
      style={styles.row}
      disable={economy.isOrder}
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
      <View style={{ flexGrow: 1, flexBasis: 1 }}>
        <StyledText ellipsizeMode="tail" numberOfLines={1}>
          {detail ? path : economy.category.name}
        </StyledText>
        <StyledText color={colors.text} verySmall ellipsizeMode="tail" numberOfLines={1}>
          {economy.description}
        </StyledText>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <StyledText bold>{thousandsSystem(economy.quantity)}</StyledText>
        <StyledText
          verySmall
          color={economy.type === EconomyEnums.Income ? colors.primary : "#f71010"}
        >
          {thousandsSystem(economy.value)}
        </StyledText>
      </View>
    </StyledButton>
  );
};

const combineData = (economies: EconomyType[], orders: Order[]): EconomyType[] => {
  // Convertir orders y sales a un formato similar a Economy
  const convertedOrders = orders.map((order) => ({
    id: order.id,
    supplier: null,
    type: Type.Income,
    category: { id: "order", name: "Venta" },
    value: order.total,
    quantity: 1,
    unit: "",
    description: `Orden #${order.order}`,
    date: order.creationDate,
    reference: order.invoice,
    brand: "",
    creationDate: order.creationDate,
    modificationDate: order.modificationDate,
    isOrder: true, // Marcar como order para identificarlo
  }));

  // Combinar economies, convertedOrders
  let combinedData = [...economies, ...convertedOrders];

  // Ordenar por fecha de creación
  combinedData.sort((a, b) => moment(b.creationDate).diff(moment(a.creationDate)));

  return combinedData;
};

type EconomyScreenProps = {
  economies: EconomyType[];
  orders?: Order[];
  sales?: Order[];
};

const EconomyScreen: React.FC<EconomyScreenProps> = ({ economies, orders = [] }) => {
  const { colors } = useTheme();

  const [isDetail, setDetail] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const [date, setDate] = useState<DateType>(resetDate);

  const filtered = <T extends { creationDate: number }>(items: T[]): T[] => {
    return items.filter(
      (item) =>
        date.type === TypeEnums.All ||
        (moment(item.creationDate).isSameOrAfter(date.start) &&
          moment(item.creationDate).isSameOrBefore(date.end)),
    );
  };

  const sorted = useMemo(() => combineData(economies, orders), [orders, economies]);

  const data: EconomyType[] = useMemo(() => {
    const filteredByDate = filtered<EconomyType>(sorted);
    if (!search) return filteredByDate;
    const searchTerm = search.toLowerCase();
    const filteredBySearch = filteredByDate.filter(
      (d) =>
        d.category.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm),
    );
    return filteredBySearch;
  }, [sorted, search, date]);

  const totalValue = useMemo(() => data.reduce((a, b) => a + b.value, 0), [data]);

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
              <StyledText color={colors.primary}>NO HAY ORDENES PARA LA BÚSQUEDA</StyledText>
            )}
            <FlatList
              data={data}
              style={{ flexGrow: 1 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Card economy={item} detail={isDetail} />}
            />
            <View style={{ paddingVertical: 10, flexDirection: "row", justifyContent: "flex-end" }}>
              <StyledButton
                style={{ width: "auto" }}
                backgroundColor={isDetail ? colors.primary : colors.card}
                onPress={() => setDetail(!isDetail)}
              >
                <StyledText smallParagraph color={isDetail ? "#FFFFFF" : colors.text}>
                  Detalles
                </StyledText>
              </StyledButton>
            </View>
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
