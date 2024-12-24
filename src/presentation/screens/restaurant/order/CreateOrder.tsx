import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { Element, Order, Save } from "domain/entities/data/common";
import { add } from "application/slice/restaurants/menu.slice";
import SalesBoxScreen from "presentation/screens/common/sales/trade/SalesBoxScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import useSave, { CallbackProps } from "../hooks/useSave";

type CreateOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateOrder">;
};

const CreateOrder: React.FC<CreateOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { kitchen } = useSave();

  const menu = useAppSelector((state) => state.menu);
  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const [elements, setElements] = useState<Element[]>([]);

  const defaultValue = route.params?.defaultValue;
  const restaurantID = route.params.restaurantID;
  const tableID = route.params.tableID;

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

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootRestaurant>["navigate"])(
      "RestaurantRoutes",
      { screen: "OrderCompleted", params: { sale: order } },
    );
  };

  return (
    <SalesBoxScreen
      defaultValue={defaultValue}
      locationID={restaurantID}
      tableID={tableID}
      elements={elements}
      addElement={(data) => dispatch(add(data))}
      onPressEdit={(defaultValue) => {
        navigation.push("RestaurantRoutes", {
          screen: "MenuTab",
          params: { restaurantID, defaultValue },
        });
      }}
      sendButton={() => navigation.navigate("PreviewOrder", { restaurantID, tableID })}
      buttonsEvent={{
        // delivery: () => alert("Para la segunda actualización"),
        kitchen: (props: Save, order: Order | null) => kitchen(props, order, next),
      }}
    />
  );
};

export default CreateOrder;
