import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Element, Group, Order, Save } from "domain/entities/data/common";
import { add } from "application/slice/restaurants/menu.slice";
import useSave, { CallbackProps } from "../hooks/useSave";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import apiClient from "infrastructure/api/server";
import SalesBoxScreen from "presentation/screens/common/sales/trade/SalesBoxScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import endpoints from "config/constants/api.endpoints";

type CreateOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateOrder">;
};

const CreateOrder: React.FC<CreateOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { kitchen } = useSave();
  const { emit } = useWebSocketContext();

  const menuGroup = useAppSelector((state) => state.menuGroup);
  const menu = useAppSelector((state) => state.menu);
  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const [groups, setGroups] = useState<Group[]>([]);
  const [elements, setElements] = useState<Element[]>([]);

  const defaultValue = route.params?.defaultValue;
  const restaurantID = route.params.restaurantID;
  const tableID = route.params.tableID;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({
      title: "Lista de menú",
      headerRight: () => (
        <TouchableOpacity
          style={styles.create}
          onPress={() =>
            navigation.push("RestaurantRoutes", { screen: "MenuTab", params: { restaurantID } })
          }
        >
          <Ionicons name="add" color={colors.primary} size={20} />
          <StyledText smallParagraph>Menú</StyledText>
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setElements([...menu].filter((p) => p.locationID === restaurantID));
  }, [restaurantID, menu]);

  useEffect(() => {
    setGroups([...menuGroup].filter((m) => m.ownerID === restaurantID));
  }, [restaurantID, menuGroup]);

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
    emit("accessToRestaurant");
  };

  return (
    <SalesBoxScreen
      defaultValue={defaultValue!}
      locationID={restaurantID}
      tableID={tableID}
      groups={groups}
      elements={elements}
      addElement={addElement}
      onPressGroup={(group?: Group) => {
        navigation.push("RestaurantRoutes", {
          screen: "CreateGroup",
          params: { group, restaurantID },
        });
      }}
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

const styles = StyleSheet.create({
  create: {
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CreateOrder;
