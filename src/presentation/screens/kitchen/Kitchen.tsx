import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { changeDate, thousandsSystem } from "shared/utils";
import {
  selectConfirmedOrder,
  selectProcessingOrder,
  selectRequestedOrder,
} from "application/selectors";
import { Kitchen as KitchenType } from "domain/entities/data/kitchens";
import { Status } from "domain/enums/data/kitchen/status.enums";
import { Selection } from "domain/entities/data/common";
import { edit } from "application/slice/kitchens/kitchens.slice";
import moment from "moment";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";

const Tab = createMaterialTopTabNavigator();

const Order: React.FC<{ order: Selection }> = ({ order }) => {
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: "row" }}>
        <StyledText style={{ marginRight: 15 }}>{thousandsSystem(order.quantity)}x</StyledText>
        <StyledText>{order.name}</StyledText>
      </View>
      <StyledText>{order.unit}</StyledText>
    </View>
  );
};

const Card: React.FC<{ order: KitchenType; onPress: () => void }> = ({ order, onPress }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <StyledText smallSubtitle>{order.location}</StyledText>
          <View style={styles.row}>
            <StyledText>
              Orden: <StyledText color={colors.primary}>{order.order}</StyledText>
            </StyledText>
            <StyledText>{changeDate(new Date(order.creationDate))}</StyledText>
          </View>
        </View>
        <StyledButton style={[styles.cardButton, { borderColor: colors.border }]} onPress={onPress}>
          <Ionicons name="checkmark" size={22} color={colors.primary} />
          <StyledText verySmall>
            {order.status === Status.Confirmed ? "ENTREGADO" : "TERMINADO"}
          </StyledText>
        </StyledButton>
      </View>
      <View style={{ marginVertical: 15 }}>
        {order.selection.map((order) => (
          <Order key={order.id} order={order} />
        ))}
      </View>
      <View>
        <StyledText>Creación {moment(new Date(order.creationDate)).format("HH:mm")}</StyledText>
        {order.observation && (
          <StyledText justify>
            Observación: <StyledText color={colors.primary}>{order.observation}</StyledText>
          </StyledText>
        )}
      </View>
    </View>
  );
};

type ScreenKitchenProps = {
  orders: KitchenType[];
  status: Status;
};

const ScreenKitchen: React.FC<ScreenKitchenProps> = ({ orders, status }) => {
  const { colors } = useTheme();

  const restaurants = useAppSelector((state) => state.restaurants);

  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState({ restaurant: "Todos" });

  const [restaurantModal, setRestaurantModal] = useState<boolean>(false);
  const [restaurantFilter, setRestaurantFilter] = useState<{ label: string; value: string }[]>([]);

  const data = useMemo(() => {
    const isDefaultFilter = filters.restaurant === "Todos" && !search;
    if (isDefaultFilter) return orders;

    const searchTerm = search.toLowerCase();
    const matchesSearch = (o: KitchenType) =>
      !search || o.selection.some((s) => s.name.toLowerCase().includes(searchTerm));

    const matchesFilters = (o: KitchenType) =>
      filters.restaurant === "Todos" || o.restaurantID === filters.restaurant;

    return orders.filter((o) => matchesSearch(o) && matchesFilters(o));
  }, [orders, search, filters]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const data = restaurants.map((r) => ({ label: r.name, value: r.id }));
    setRestaurantFilter(data);
  }, [restaurants]);

  return (
    <>
      <Layout style={{ padding: 0 }}>
        {!orders.length ? (
          <StyledText color={colors.primary} style={{ padding: 20 }}>
            NO HAY ORDENES EN ESTE ESTADO
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
            <View style={{ flex: 1 }}>
              <View style={[styles.filterContainer, { borderColor: colors.border }]}>
                {/* <TouchableOpacity style={styles.alignHorizontally} onPress={() => {}}>
                  <Ionicons name="people-outline" size={25} />
                  <StyledText style={{ marginHorizontal: 5 }}>Vendedores</StyledText>
                  <Ionicons name={false ? "caret-up" : "caret-down"} />
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.alignHorizontally}
                  onPress={() => setRestaurantModal(true)}
                >
                  <Ionicons name="bookmarks-outline" size={25} />
                  <StyledText style={{ marginHorizontal: 5 }}>
                    {filters.restaurant === "Todos"
                      ? "Todos los restaurantes"
                      : restaurantFilter.find((l) => l.value === filters.restaurant)?.label}
                  </StyledText>
                  <Ionicons name={false ? "caret-up" : "caret-down"} />
                </TouchableOpacity>
              </View>
              {!data.length && (
                <StyledText color={colors.primary} style={{ padding: 20 }}>
                  NO HAY ORDENES PARA LA BÚSQUEDA
                </StyledText>
              )}
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card order={item} onPress={() => dispatch(edit({ ...item, status }))} />
                )}
              />
            </View>
          </>
        )}
      </Layout>
      <PickerFloorModal
        data={[{ label: "Todas las localidades", value: "Todos" }, ...restaurantFilter]}
        title="FILTRAR POR RESTAURANTES"
        isRemove={false}
        visible={restaurantModal}
        onClose={() => setRestaurantModal(false)}
        onSubmit={(restaurant) =>
          setFilters((prev) => ({ ...prev, restaurant: restaurant as string }))
        }
      />
    </>
  );
};

//TODO EN DELIVERY TENEMOS 3 ESTADOS: ESPERANDO (Llevado por - agregar), ENVIADO Y ENTREGADO.

const Kitchen = () => {
  const { colors } = useTheme();

  const requested = useAppSelector(selectRequestedOrder);
  const processing = useAppSelector(selectProcessingOrder);
  const confirmed = useAppSelector(selectConfirmedOrder);

  const BadgeIcon: React.FC<{ count: number }> = ({ count }) => (
    <View style={[styles.order, { backgroundColor: colors.primary }]}>
      <StyledText verySmall color="#FFFFFF">
        {thousandsSystem(count)}
      </StyledText>
    </View>
  );

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="SOLICITADO"
        options={{
          tabBarBadge: () => requested.length > 0 && <BadgeIcon count={requested.length} />,
        }}
      >
        {(props) => <ScreenKitchen orders={requested} status={Status.Processing} />}
      </Tab.Screen>
      <Tab.Screen
        name="PROCESANDO"
        options={{
          tabBarBadge: () => processing.length > 0 && <BadgeIcon count={processing.length} />,
        }}
      >
        {(props) => <ScreenKitchen orders={processing} status={Status.Confirmed} />}
      </Tab.Screen>
      <Tab.Screen
        name="CONFIRMADO"
        options={{
          tabBarBadge: () => confirmed.length > 0 && <BadgeIcon count={confirmed.length} />,
        }}
      >
        {(props) => <ScreenKitchen orders={confirmed} status={Status.Completed} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  order: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    right: 5,
    top: 13,
  },
  alignHorizontally: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center", //TODO PENDIENTE AQUI
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  card: {
    padding: 20,
    borderBottomWidth: 0.5,
  },
  cardButton: {
    width: "auto",
    marginLeft: 10,
    alignItems: "center",
    backgroundColor: "transparent",
    elevation: 0,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});

export default Kitchen;
