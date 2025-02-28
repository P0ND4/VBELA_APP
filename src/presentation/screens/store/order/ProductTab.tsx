import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import { Element } from "domain/entities/data/common/element.entity";
import { add, edit, remove } from "application/slice/stores/products.slice";
import { random } from "shared/utils";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import apiClient, { endpoints } from "infrastructure/api/server";
import ElementTab from "presentation/screens/common/sales/element/ElementTab";
import Ionicons from "@expo/vector-icons/Ionicons";

type ProductTabProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"ProductTab">;
};

const ProductTab: React.FC<ProductTabProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const productGroup = useAppSelector((state) => state.productGroup);
  const stores = useAppSelector((state) => state.stores);

  const [inventories, setInventories] = useState<string[]>([]);

  const defaultValue = route.params?.defaultValue;
  const storeID = route.params.storeID;

  const dispatch = useAppDispatch();

  const save = async (data: Element) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.product.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Element) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.product.put(data.id),
      method: "PUT",
      data,
    });
  };

  const removeItem = async (id: string) => {
    dispatch(remove({ id }));
    navigation.pop();
    await apiClient({
      url: endpoints.product.delete(id),
      method: "DELETE",
    });
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
    navigation.setOptions({ title: "Crear producto" });
  }, []);

  useEffect(() => {
    const { inventories = [] } = stores.find((r) => r.id === storeID) ?? {};
    setInventories(inventories);
  }, [stores]);

  return (
    <ElementTab
      visible={Visible.Store}
      inventories={inventories}
      onSubmit={defaultValue ? update : save}
      defaultValue={defaultValue}
      locationID={storeID}
      groups={productGroup}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: { flexDirection: "row", alignItems: "center", paddingRight: 15 },
  icon: { marginHorizontal: 6 },
});

export default ProductTab;
