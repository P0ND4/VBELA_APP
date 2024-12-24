import React, { useEffect } from "react";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { Order, PaymentMethod, Save } from "domain/entities/data/common";
import { StackNavigationProp } from "@react-navigation/stack";
import SalesPaymentScreen from "presentation/screens/common/sales/trade/SalesPaymentScreen";
import useSave, { CallbackProps } from "../hooks/useSave";
import { useAppSelector } from "application/store/hook";

type OrderPaymentProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"OrderPayment">;
};

const OrderPayment: React.FC<OrderPaymentProps> = ({ navigation, route }) => {
  const { save, update } = useSave();

  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const restaurantID = route.params.restaurantID;
  const tableID = route.params.tableID;

  useEffect(() => {
    navigation.setOptions({ title: "Pagar orden" });
  }, []);

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootRestaurant>["navigate"])(
      "RestaurantRoutes",
      { screen: "OrderCompleted", params: { sale: order } },
    );
  };

  return (
    <SalesPaymentScreen
      locationID={restaurantID}
      tableID={tableID}
      onSave={(props: Save) => save(props, next)}
      onUpdate={(props: Order) => update(props, next)}
      onMultiplePayment={(paymentMethod: PaymentMethod) => {
        navigation.navigate("MultiplePayment", { restaurantID, tableID, paymentMethod });
      }}
    />
  );
};

export default OrderPayment;
