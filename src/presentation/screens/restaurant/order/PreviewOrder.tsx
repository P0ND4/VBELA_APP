import React, { useEffect } from "react";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { add } from "application/slice/restaurants/menu.slice";
import { Order, Element, Save } from "domain/entities/data/common";
import SalesPreviewScreen from "presentation/screens/common/sales/trade/SalesPreviewScreen";
import useSave, { CallbackProps } from "../hooks/useSave";
import apiClient, { endpoints } from "infrastructure/api/server";

type PreviewOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"PreviewOrder">;
};

const PreviewOrder: React.FC<PreviewOrderProps> = ({ navigation, route }) => {
  const { kitchen } = useSave();

  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const defaultValue = route.params?.defaultValue;
  const restaurantID = route.params.restaurantID;
  const tableID = route.params.tableID;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: "Previsualizar orden" });
  }, []);

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootRestaurant>["navigate"])(
      "RestaurantRoutes",
      { screen: "OrderCompleted", params: { sale: order } },
    );
  };

  const addElement = async (data: Element) => {
    dispatch(add(data));
    await apiClient({
      url: endpoints.menu.post(),
      method: "POST",
      data,
    });
  };

  return (
    <SalesPreviewScreen
      defaultValue={defaultValue}
      sendButton={() => navigation.navigate("OrderPayment", { restaurantID, tableID })}
      goBack={() => navigation.pop()}
      addElement={addElement}
      locationID={restaurantID}
      tableID={tableID}
      buttonsEvent={{
        kitchen: (props: Save, order: Order | null) => kitchen(props, order, next),
        // delivery: () => alert("Para la segunda actualización"),
      }}
    />
  );
};

export default PreviewOrder;
