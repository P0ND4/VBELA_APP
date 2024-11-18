import React, { useEffect } from "react";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch } from "application/store/hook";
import { add } from "application/slice/restaurants/menu.slice";
import SalesPreviewScreen from "presentation/screens/common/sales/trade/SalesPreviewScreen";

type PreviewOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"PreviewOrder">;
};

const PreviewOrder: React.FC<PreviewOrderProps> = ({ navigation, route }) => {
  const restaurantID = route.params.restaurantID;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: "Previsualizar orden" });
  }, []);

  return (
    <SalesPreviewScreen
      sendButton={() => navigation.navigate("OrderPayment")}
      goBack={() => navigation.pop()}
      addElement={(data) => dispatch(add(data))}
      locationID={restaurantID}
      buttonsEvent={{
        kitchen: () => alert("Para la segunda actualización"),
        delivery: () => alert("Para la segunda actualización"),
      }}
    />
  );
};

export default PreviewOrder;
