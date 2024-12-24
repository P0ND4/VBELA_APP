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

type MenuTabProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"MenuTab">;
};

const MenuTab: React.FC<MenuTabProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const restaurants = useAppSelector((state) => state.restaurants);

  const [inventories, setInventories] = useState<string[]>([]);

  const defaultValue = route.params?.defaultValue;
  const restaurantID = route.params?.restaurantID;

  const dispatch = useAppDispatch();

  const save = (data: Element) => {
    dispatch(add(data));
    navigation.pop();
  };

  const update = (data: Element) => {
    dispatch(edit(data));
    navigation.pop();
  };

  useEffect(() => {
    if (defaultValue) {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => alert("Para la tercera actualización")}
            >
              <Ionicons name="share-social-outline" color={colors.text} size={25} />
            </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.icon}
              onPress={() => {
                dispatch(remove({ id: defaultValue.id }));
                navigation.pop();
              }}
            >
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
    setInventories(inventories)
  }, [restaurants]);

  return (
    <ElementTab
      visible={Visible.Restaurant}
      inventories={inventories}
      onSubmit={defaultValue ? update : save}
      defaultValue={defaultValue}
      locationID={restaurantID}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: { flexDirection: "row", alignItems: "center", paddingRight: 15 },
  icon: { marginHorizontal: 6 },
});

export default MenuTab;
