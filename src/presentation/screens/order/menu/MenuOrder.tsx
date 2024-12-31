import React, { useEffect, useState } from "react";
import { useAppSelector } from "application/store/hook";
import { selectPendingOrders } from "application/selectors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { Order } from "domain/entities/data/common";
import { Status } from "domain/enums/data/element/status.enums";
import OrdersScreen from "presentation/screens/common/orders/OrdersScreen";

type NavigationProps = StackNavigationProp<RootApp>;

type MenuOrderProps = {
  orders: Order[];
  statusFilter?: Status[];
};

const MenuOrder: React.FC<MenuOrderProps> = ({ orders, statusFilter = [] }) => {
  const restaurants = useAppSelector((state) => state.restaurants);

  const [locationFilter, setLocationFilter] = useState<{ label: string; value: string }[]>([]);

  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const data = restaurants.map((r) => ({ label: r.name, value: r.id }));
    setLocationFilter(data);
  }, [restaurants]);

  return (
    <OrdersScreen
      orders={orders}
      locationFilter={locationFilter}
      statusFilter={statusFilter}
      navigateToInformation={(order: Order) => {
        navigation.navigate("OrderRoutes", {
          screen: "MenuViewOrder",
          params: { order },
        });
      }}
    />
  );
};

export default MenuOrder;
