import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { add, edit, remove } from "application/slice/restaurants/menu.slice";
import { random } from "shared/utils";
import { Element } from "domain/entities/data/common";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import ElementTab from "presentation/screens/common/sales/element/ElementTab";
import Ionicons from "@expo/vector-icons/Ionicons";
import apiClient from "infrastructure/api/server";
import endpoints from "config/constants/api.endpoints";
import { useWebSocketContext } from "infrastructure/context/SocketContext";

type MenuTabProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"MenuTab">;
};

const MenuTab: React.FC<MenuTabProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const menuGroup = useAppSelector((state) => state.menuGroup);
  const restaurants = useAppSelector((state) => state.restaurants);

  const [inventories, setInventories] = useState<string[]>([]);

  const defaultValue = route.params?.defaultValue;
  const restaurantID = route.params?.restaurantID;

  const dispatch = useAppDispatch();

  const save = async (data: Element) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.menu.post(),
      method: "POST",
      data,
    });
    emit("accessToRestaurant");
  };

  const update = async (data: Element) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.menu.put(data.id),
      method: "PUT",
      data,
    });
    emit("accessToRestaurant");
  };

  const removeItem = async (id: string) => {
    dispatch(remove({ id }));
    navigation.pop();
    await apiClient({
      url: endpoints.menu.delete(id),
      method: "DELETE",
    });
    emit("accessToRestaurant");
  };

  useEffect(() => {
    if (defaultValue) {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.iconContainer}>
            {/* <TouchableOpacity
              style={styles.icon}
              onPress={() => alert("Para la tercera actualización")}
            >
              <Ionicons name="share-social-outline" color={colors.text} size={25} />
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.icon}
              onPress={() => {
                save({
                  ...defaultValue,
                  id: random(10),
                  name: `${defaultValue.name.slice(0, 26)} (1)`,
                });
              }}
            >
              <Ionicons name="duplicate-outline" color={colors.text} size={25} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon} onPress={() => removeItem(defaultValue.id)}>
              <Ionicons name="trash-outline" color={colors.text} size={25} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [defaultValue]);

  useEffect(() => {
    navigation.setOptions({ title: "Crear menú" });
  }, []);

  useEffect(() => {
    const { inventories = [] } = restaurants.find((r) => r.id === restaurantID) ?? {};
    setInventories(inventories);
  }, [restaurants]);

  return (
    <ElementTab
      visible={Visible.Restaurant}
      inventories={inventories}
      onSubmit={defaultValue ? update : save}
      defaultValue={defaultValue}
      locationID={restaurantID}
      groups={menuGroup}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: { flexDirection: "row", alignItems: "center", paddingRight: 15 },
  icon: { marginHorizontal: 6 },
});

export default MenuTab;
