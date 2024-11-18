import React, { useEffect } from "react";
import SalesCompletedScreen from "presentation/screens/common/sales/trade/SalesCompletedScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";

type SalesCompletedScreenProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"OrderCompleted">;
};

const OrderCompleted: React.FC<SalesCompletedScreenProps> = ({ navigation, route }) => {
  const sale = route.params.sale;

  useEffect(() => {
    navigation.setOptions({ title: "Pedido completado" });
  }, []);

  return (
    <SalesCompletedScreen
      trade={sale}
      goInvoice={() => navigation.navigate("Invoice", { sale })}
      goBack={() => navigation.pop()}
    />
  );
};

export default OrderCompleted;
