import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Selection } from "domain/entities/data/common";
import { edit } from "application/slice/kitchens/kitchens.slice";
import { Kitchen, Kitchen as KitchenType } from "domain/entities/data/kitchens";
import { Status } from "domain/enums/data/kitchen/status.enums";
import { useTheme } from "@react-navigation/native";
import { changeDate, thousandsSystem } from "shared/utils";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import apiClient from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import StyledText from "presentation/components/text/StyledText";
import endpoints from "config/constants/api.endpoints";

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

const Card: React.FC<{ order: KitchenType; onPress: () => void; refresh: boolean }> = React.memo(
  ({ order, onPress, refresh }) => {
    const { colors } = useTheme();

    const getDurationInMinutes = (creationDate: Date) => {
      const now = new Date();
      const diffInMilliseconds = now.getTime() - creationDate.getTime();
      return `${Math.floor(diffInMilliseconds / (1000 * 60))} minutos`;
    };

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
          {order.status !== Status.Completed && (
            <StyledButton
              style={[styles.cardButton, { borderColor: colors.border }]}
              onPress={onPress}
            >
              <Ionicons name="checkmark" size={22} color={colors.primary} />
              <StyledText verySmall>
                {order.status === Status.Confirmed ? "ENTREGADO" : "TERMINADO"}
              </StyledText>
            </StyledButton>
          )}
        </View>
        <View style={{ marginVertical: 10 }}>
          {order.selection.map((order) => (
            <Order key={order.id} order={order} />
          ))}
        </View>
        <View>
          <StyledText>Creación {new Date(order.creationDate).toLocaleTimeString()}</StyledText>
          {order.observation && (
            <StyledText justify>
              Observación: <StyledText color={colors.primary}>{order.observation}</StyledText>
            </StyledText>
          )}
          <StyledText color={colors.primary}>
            {getDurationInMinutes(new Date(order.creationDate))}
          </StyledText>
        </View>
      </View>
    );
  },
);

Card.displayName = "Card";

type KitchenScreenProps = {
  orders: KitchenType[];
  status?: Status;
};

const KitchenScreen: React.FC<KitchenScreenProps> = ({ orders, status }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const restaurants = useAppSelector((state) => state.restaurants);

  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState({ restaurant: "Todos" });
  const [restaurantModal, setRestaurantModal] = useState<boolean>(false);
  const [restaurantFilter, setRestaurantFilter] = useState<{ label: string; value: string }[]>([]);
  const [refresh, setRefresh] = useState(false);

  const dispatch = useAppDispatch();

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

  useEffect(() => {
    const data = restaurants.map((r) => ({ label: r.name, value: r.id }));
    setRestaurantFilter(data);
  }, [restaurants]);

  const update = async (item: Kitchen) => {
    if (!status) return;
    const data = { ...item, status, modificationDate: Date.now() };
    dispatch(edit(data));
    await apiClient({
      url: endpoints.kitchen.put(item.id),
      method: "PUT",
      data,
    });
    emit("accessToKitchen");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => !prev);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
                  <Ionicons name={restaurantModal ? "caret-up" : "caret-down"} />
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
                  <Card order={item} onPress={() => update(item)} refresh={refresh} />
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alignHorizontally: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
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

export default KitchenScreen;
