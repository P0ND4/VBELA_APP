import React, { useEffect, useState } from "react";
import moment from "moment";
import { StackNavigationProp } from "@react-navigation/stack";
import { OrderRouteProp, RootStore } from "domain/entities/navigation";
import { changeDate } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Order } from "domain/entities/data/common";
import { Status } from "domain/enums/data/element/status.enums";
import ViewOrder from "../common/ViewOrderScreen";
import useSave from "presentation/screens/store/hooks/useSave";
import {
  change,
  SalesNavigation,
} from "application/appState/navigation/sales.navigation.method.slice";

type ProductOrderProps = {
  navigation: StackNavigationProp<RootStore>;
  route: OrderRouteProp<"ProductViewOrder">;
};

const ProductViewOrder: React.FC<ProductOrderProps> = ({ navigation, route }) => {
  const { update } = useSave();

  const order = route.params.order;

  const sales = useAppSelector((state) => state.sales);

  const [data, setData] = useState<Order>(order);

  const dispatch = useAppDispatch();

  useEffect(() => {
    data &&
      navigation.setOptions({
        title: `${changeDate(new Date(data.creationDate))} a las ${moment(new Date(data.creationDate)).format("HH:mm")}`,
      });
  }, [data]);

  useEffect(() => {
    const data = sales.find((s) => s.id === order.id);
    if (!data) return navigation.pop();
    setData(data);
  }, [sales]);

  const onChange = (updatedData: Partial<Order>) => {
    const modificationDate = new Date().getTime();
    const order = { ...data, ...updatedData, modificationDate };
    data && update(order);
    if (order.status === Status.Canceled) return navigation.pop();
    if (order.status === Status.Completed) {
      navigation.replace("StoreRoutes", { screen: "OrderCompleted", params: { sale: order } });
    }
  };

  return (
    <ViewOrder
      order={data}
      onChange={onChange}
      onEditOrder={() => {
        dispatch(change(SalesNavigation.Replace));
        navigation.navigate("ProviderStoreRoutes", {
          screen: data.status === Status.Confirmed ? "PreviewOrder" : "CreateOrder",
          params: { storeID: data.locationID, defaultValue: data },
        });
      }}
    />
  );
};

export default ProductViewOrder;
