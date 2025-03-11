import React, { useEffect, useState } from "react";
import moment from "moment";
import { StackNavigationProp } from "@react-navigation/stack";
import { OrderRouteProp, RootRestaurant } from "domain/entities/navigation";
import { changeDate } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Order } from "domain/entities/data/common";
import { Status } from "domain/enums/data/element/status.enums";
import ViewOrder from "../common/ViewOrderScreen";
import useSave from "presentation/screens/restaurant/hooks/useSave";
import {
  change,
  SalesNavigation,
} from "application/appState/navigation/sales.navigation.method.slice";

type MenuViewOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: OrderRouteProp<"MenuViewOrder">;
};

const MenuViewOrder: React.FC<MenuViewOrderProps> = ({ navigation, route }) => {
  const { update } = useSave();

  const order = route.params.order;

  const orders = useAppSelector((state) => state.orders);

  const [data, setData] = useState<Order>(order);

  const dispatch = useAppDispatch();

  useEffect(() => {
    data &&
      navigation.setOptions({
        title: `${changeDate(new Date(data.creationDate))} a las ${moment(new Date(data.creationDate)).format("HH:mm")}`,
      });
  }, [data]);

  useEffect(() => {
    const data = orders.find((s) => s.id === order.id);
    if (!data) return navigation.pop();
    setData(data);
  }, [orders]);

  const onChange = (updatedData: Partial<Order>) => {
    const modificationDate = new Date().getTime();
    const order = { ...data, ...updatedData, modificationDate };
    data && update(order);
    if (order.status === Status.Canceled) return navigation.pop();
    if (order.status === Status.Completed) {
      navigation.replace("RestaurantRoutes", { screen: "OrderCompleted", params: { sale: order } });
    }
  };

  return (
    <ViewOrder
      order={data}
      onChange={onChange}
      onEditOrder={() => {
        dispatch(change(SalesNavigation.Replace));
        navigation.navigate("ProviderRestaurantRoutes", {
          screen: data.status === Status.Confirmed ? "PreviewOrder" : "CreateOrder",
          params: { restaurantID: data.locationID, defaultValue: data },
        });
      }}
    />
  );
};

export default MenuViewOrder;
