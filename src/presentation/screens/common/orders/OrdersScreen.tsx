import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import moment from "moment";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import type { Order as OrderType } from "domain/entities/data/common";
import { addDays, beautifulChangeDate, thousandsSystem } from "shared/utils";
import { useStatusInfo } from "presentation/screens/order/hooks/useStatusInfo";
import { Status } from "domain/enums/data/element/status.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import FloorModal from "presentation/components/modal/FloorModal";

const StatusOption: React.FC<{ item: Status; onChange: () => void }> = ({ item, onChange }) => {
  const status = useStatusInfo(item);

  return (
    <TouchableOpacity style={styles.option} onPress={onChange}>
      <Ionicons name={status.icon} color={status.color} size={24} style={{ marginRight: 15 }} />
      <StyledText color={status.color}>{item}</StyledText>
    </TouchableOpacity>
  );
};

type OrderProps = { order: OrderType; navigateToInformation: (order: OrderType) => void };

const Order: React.FC<OrderProps> = ({ order, navigateToInformation }) => {
  const coin = useAppSelector((state) => state.coin);

  const { color, icon, lineThrough } = useStatusInfo(order.status);

  return (
    <TouchableOpacity style={{ marginVertical: 10 }} onPress={() => navigateToInformation(order)}>
      <View style={styles.row}>
        <View style={styles.alignHorizontally}>
          <Ionicons name={icon} size={25} color={color} />
          <StyledText style={{ marginHorizontal: 4 }} lineThrough={lineThrough}>
            {coin} {thousandsSystem(order.total)}
          </StyledText>
          {/* <StyledText verySmall lineThrough={lineThrough}>
            por NOMBRE
          </StyledText> */}
        </View>
        <StyledText color={color} lineThrough={lineThrough}>
          {moment(new Date(order.creationDate)).format("HH:mm")}
        </StyledText>
      </View>
      <View style={styles.row}>
        <StyledText smallParagraph lineThrough={lineThrough}>
          {order.selection.map((b) => `${thousandsSystem(b.quantity)}x ${b.name}`).join(" ")}
        </StyledText>
        <StyledText smallParagraph lineThrough={lineThrough}>
          #{order.order}
        </StyledText>
      </View>
    </TouchableOpacity>
  );
};

type GroupedOrder = {
  date: string;
  orders: OrderType[];
};

type CardProps = {
  group: GroupedOrder;
  navigateToInformation: (order: OrderType) => void;
};

const Card: React.FC<CardProps> = ({ group, navigateToInformation }) => {
  const { colors } = useTheme();

  const coin = useAppSelector((state) => state.coin);
  const total = group.orders.reduce((a, b) => a + b.total, 0);

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText smallSubtitle>{beautifulChangeDate(addDays(new Date(group.date), 1))}</StyledText>
      <StyledText color={colors.primary}>
        {thousandsSystem(group.orders.length)} pedidos, {coin} {thousandsSystem(total)}
      </StyledText>
      <View style={{ marginTop: 15 }}>
        {group.orders.map((order) => (
          <Order key={order.id} order={order} navigateToInformation={navigateToInformation} />
        ))}
      </View>
    </View>
  );
};

type OrdersScreenProps = {
  orders: OrderType[];
  showFilter?: boolean;
  statusFilter?: Status[];
  locationFilter?: { label: string; value: string }[];
  navigateToInformation: (order: OrderType) => void;
};

const groupByDate = (orders: OrderType[]) => {
  const group = orders.reduce(
    (acc, order) => {
      const date = new Date(order.creationDate).toLocaleDateString("en-CA");
      if (!acc[date]) acc[date] = [];
      acc[date].push(order);
      return acc;
    },
    {} as Record<string, OrderType[]>,
  );
  return Object.entries(group).map(([date, orders]) => ({ date, orders }));
};

const OrdersScreen: React.FC<OrdersScreenProps> = ({
  orders,
  showFilter = true,
  locationFilter = [],
  statusFilter = [],
  navigateToInformation,
}) => {
  const { colors } = useTheme();

  const coin = useAppSelector((state) => state.coin);

  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState({ status: "Todos", location: "Todos" });

  const [statusModal, setStatusModal] = useState<boolean>(false);
  const [locationModal, setLocationModal] = useState<boolean>(false);

  const data = useMemo(() => {
    const isDefaultFilter = filters.status === "Todos" && filters.location === "Todos" && !search;
    if (isDefaultFilter) return groupByDate(orders);

    const searchTerm = search.toLowerCase();
    const matchesSearch = (o: OrderType) =>
      !search || o.selection.some((s) => s.name.toLowerCase().includes(searchTerm));

    const matchesFilters = (o: OrderType) =>
      (filters.status === "Todos" || o.status === filters.status) &&
      (filters.location === "Todos" || o.locationID === filters.location);

    const filtered = orders.filter((o) => matchesSearch(o) && matchesFilters(o));
    return groupByDate(filtered);
  }, [orders, search, filters]);

  const allOrders = useMemo(() => data.flatMap((d) => d.orders), [data]);
  const total = allOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <>
      <Layout style={{ padding: 0, justifyContent: "space-between" }}>
        {!orders.length ? (
          <StyledText color={colors.primary} style={{ padding: 20 }}>
            NO HAY PEDIDOS REGISTRADOS
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
              {showFilter && (
                <View style={[styles.filterContainer, { borderColor: colors.border }]}>
                  {!!statusFilter.length && (
                    <TouchableOpacity
                      style={styles.alignHorizontally}
                      onPress={() => setStatusModal(true)}
                    >
                      <Ionicons name="time" size={25} color={colors.text} />
                      <StyledText style={{ marginHorizontal: 5 }}>
                        {filters.status === "Todos" ? "Estados" : filters.status}
                      </StyledText>
                      <Ionicons name={false ? "caret-up" : "caret-down"} />
                    </TouchableOpacity>
                  )}
                  {/* <TouchableOpacity
                    style={styles.alignHorizontally}
                    onPress={() => alert("Para la segunda actualización")}
                  >
                    <Ionicons name="people-outline" size={25} />
                    <StyledText style={{ marginHorizontal: 5 }}>Vendedores</StyledText>
                    <Ionicons name={false ? "caret-up" : "caret-down"} />
                  </TouchableOpacity> */}
                  {!!locationFilter.length && (
                    <TouchableOpacity
                      style={styles.alignHorizontally}
                      onPress={() => setLocationModal(true)}
                    >
                      <Ionicons name="bookmarks-outline" size={25} />
                      <StyledText style={{ marginHorizontal: 5 }}>
                        {filters.location === "Todos"
                          ? "Localidades"
                          : locationFilter.find((l) => l.value === filters.location)?.label}
                      </StyledText>
                      <Ionicons name={false ? "caret-up" : "caret-down"} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {!data.length && (
                <StyledText color={colors.primary} style={{ padding: 20 }}>
                  NO HAY ORDENES PARA LA BÚSQUEDA
                </StyledText>
              )}
              <FlatList
                data={data}
                keyExtractor={(item) => item.date}
                renderItem={({ item }) => (
                  <Card group={item} navigateToInformation={navigateToInformation} />
                )}
              />
            </View>
            <View style={[styles.footer, { backgroundColor: colors.card }]}>
              <StyledText bigParagraph bold>
                Total en pedidos
              </StyledText>
              <StyledText>
                {coin} {thousandsSystem(total)} de {thousandsSystem(allOrders.length)} pedidos
              </StyledText>
            </View>
          </>
        )}
      </Layout>
      <FloorModal
        title="FILTRAR POR ESTADOS"
        animationType="fade"
        style={{ maxHeight: 400 }}
        visible={statusModal}
        onClose={() => setStatusModal(false)}
      >
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            setFilters((prev) => ({ ...prev, status: "Todos" }));
            setStatusModal(false);
          }}
        >
          <Ionicons name="time" color={colors.text} size={24} style={{ marginRight: 15 }} />
          <StyledText>Todos</StyledText>
        </TouchableOpacity>
        <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
        <FlatList
          data={statusFilter}
          renderItem={({ item }) => (
            <StatusOption
              item={item}
              onChange={() => {
                setFilters((prev) => ({ ...prev, status: item }));
                setStatusModal(false);
              }}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
          )}
        />
      </FloorModal>
      <PickerFloorModal
        data={[{ label: "Todas las localidades", value: "Todos" }, ...locationFilter]}
        title="FILTRAR POR LOCALIDADES"
        isRemove={false}
        visible={locationModal}
        onClose={() => setLocationModal(false)}
        onSubmit={(location) => setFilters((prev) => ({ ...prev, location: location as string }))}
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
  footer: {
    height: 75,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  card: {
    padding: 20,
    borderBottomWidth: 0.5,
  },
  alignHorizontally: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  option: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default OrdersScreen;
