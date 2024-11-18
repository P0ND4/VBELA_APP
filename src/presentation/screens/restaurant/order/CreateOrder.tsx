import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { Element } from "domain/entities/data/common";
import { add } from "application/slice/restaurants/menu.slice";
import SalesBoxScreen from "presentation/screens/common/sales/trade/salesBoxScreen/SalesBoxScreen";
import Ionicons from "@expo/vector-icons/Ionicons";

type CreateOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateOrder">;
};

const CreateOrder: React.FC<CreateOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const menu = useAppSelector((state) => state.menu);

  const [elements, setElements] = useState<Element[]>([]);

  const restaurantID = route.params.restaurantID;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({
      title: "Crear pedido",
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() =>
            navigation.push("RestaurantRoutes", { screen: "MenuTab", params: { restaurantID } })
          }
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setElements([...menu].filter((p) => p.locationID === restaurantID));
  }, [restaurantID, menu]);

  return (
    <SalesBoxScreen
      locationID={restaurantID}
      elements={elements}
      addElement={(data) => dispatch(add(data))}
      onPressEdit={(defaultValue) => {
        navigation.push("RestaurantRoutes", {
          screen: "MenuTab",
          params: { restaurantID, defaultValue },
        });
      }}
      sendButton={() => navigation.navigate("PreviewOrder", { restaurantID })}
      buttonsEvent={{
        delivery: () => alert("Para la segunda actualización"),
        kitchen: () => alert("Para la segunda actualización"),
      }}
    />
  );
};

export default CreateOrder;
