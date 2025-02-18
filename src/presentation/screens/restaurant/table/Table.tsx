import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, FlatList, ListRenderItem } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import { thousandsSystem } from "shared/utils";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { Table as TableEntity } from "domain/entities/data/restaurants";
import { remove } from "application/slice/restaurants/tables.slice";
import TableInformation from "./TableInformation";
import {
  change,
  SalesNavigation,
} from "application/appState/navigation/sales.navigation.method.slice";
import { Order } from "domain/entities/data/common";
import { Status } from "domain/enums/data/element/status.enums";
import apiClient, { endpoints } from "infrastructure/api/server";

type NavigationProps = StackNavigationProp<RootRestaurant>;

const Card: React.FC<{ item: TableEntity }> = ({ item }) => {
  const { colors } = useTheme();

  const orders = useAppSelector((state) => state.orders);

  const [showInformation, setShowInformation] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>();

  useEffect(() => {
    const data = orders.find(
      (o) => o.tableID === item.id && ![Status.Canceled, Status.Completed].includes(o.status),
    );
    setOrder(data);
  }, [orders]);

  const navigation = useNavigation<NavigationProps>();
  const dispatch = useAppDispatch();

  const removeItem = async () => {
    dispatch(remove({ id: item.id }));
    await apiClient({
      url: endpoints.table.delete(item.id),
      method: "DELETE",
    });
  };

  return (
    <>
      <StyledButton
        style={styles.card}
        onPress={() => {
          dispatch(change(SalesNavigation.Navigate));
          navigation.navigate("ProviderRestaurantRoutes", {
            screen: order?.status === Status.Confirmed ? "PreviewOrder" : "CreateOrder",
            params: { restaurantID: item.restaurantID, tableID: item.id, defaultValue: order },
          });
        }}
        onLongPress={() => setShowInformation(true)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.highlight && (
            <Ionicons name="star" color={colors.primary} size={18} style={{ marginRight: 6 }} />
          )}
          <StyledText>{item.name}</StyledText>
        </View>
        {order && (
          <View>
            <StyledText right verySmall color={colors.primary}>
              OCUPADO
            </StyledText>
            <StyledText verySmall>
              Pedido:{" "}
              <StyledText verySmall color={colors.primary}>
                #{order.order}
              </StyledText>
            </StyledText>
          </View>
        )}
      </StyledButton>
      <TableInformation
        visible={showInformation}
        table={item}
        onClose={() => setShowInformation(false)}
        onPressDelete={removeItem}
        onPressEdit={() =>
          navigation.navigate("CreateTable", {
            defaultValue: item,
            restaurantID: item.restaurantID,
          })
        }
      />
    </>
  );
};

type TableProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"Table">;
};

const Table: React.FC<TableProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const restaurantID = route.params.restaurantID;

  const restaurants = useAppSelector((state) => state.restaurants);
  const tables = useAppSelector((state) => state.tables);

  const [data, setData] = useState<TableEntity[]>([]);

  useEffect(() => {
    const restaurant = restaurants.find((r) => r.id === restaurantID);

    navigation.setOptions({
      title: `Mesas: ${restaurant?.name}`,
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => navigation.navigate("CreateTable", { restaurantID })}
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    const found = tables.filter((t) => t.restaurantID === restaurantID);
    setData([...found].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0)));
  }, [tables, restaurantID]);

  const renderItem: ListRenderItem<TableEntity> = useCallback(
    ({ item }) => <Card item={item} />,
    [],
  );

  return (
    <Layout>
      {!data.length ? (
        <StyledText color={colors.primary}>NO HAY MESAS CREADAS</StyledText>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={renderItem}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: { marginHorizontal: 2 },
  card: {
    flexGrow: 1,
    width: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 4,
  },
});

export default React.memo(Table);
