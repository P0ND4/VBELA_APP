import React, { useEffect } from "react";
import SalesMultiplePaymentScreen from "presentation/screens/common/sales/trade/SalesMultiplePaymentScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import useSave, { CallbackProps } from "../hooks/useSave";
import { Order, Save } from "domain/entities/data/common";
import { useAppSelector } from "application/store/hook";

type MultiplePaymentProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"MultiplePayment">;
};

const MultiplePayment: React.FC<MultiplePaymentProps> = ({ navigation, route }) => {
  const { save, update } = useSave();

  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const restaurantID = route.params.restaurantID;
  const tableID = route.params.tableID;
  const paymentMethod = route.params.paymentMethod;

  useEffect(() => {
    navigation.setOptions({ title: "Pagos multiples" });
  }, []);

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootRestaurant>["navigate"])(
      "RestaurantRoutes",
      { screen: "OrderCompleted", params: { sale: order } },
    );
  };

  return (
    <SalesMultiplePaymentScreen
      locationID={restaurantID}
      tableID={tableID}
      onSave={(props: Save) => save(props, next)}
      onUpdate={(props: Order) => update(props, next)}
      paymentMethod={paymentMethod}
      goBack={() => navigation.pop()}
    />
  );
};

export default MultiplePayment;
