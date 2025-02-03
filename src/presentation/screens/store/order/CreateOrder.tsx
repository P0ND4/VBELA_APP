import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Element } from "domain/entities/data/common/element.entity";
import { add } from "application/slice/stores/products.slice";
import SalesBoxScreen from "presentation/screens/common/sales/trade/SalesBoxScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import apiClient, { endpoints } from "infrastructure/api/server";

type CreateOrderProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"CreateOrder">;
};

const CreateOrder: React.FC<CreateOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const products = useAppSelector((state) => state.products);

  const [elements, setElements] = useState<Element[]>([]);

  const storeID = route.params.storeID;
  const defaultValue = route.params?.defaultValue;

  const dispatch = useAppDispatch();

  const addElement = async (data: Element) => {
    dispatch(add(data));
    await apiClient({
      url: endpoints.product.post(),
      method: "POST",
      data,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      title: "Crear pedido",
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() =>
            navigation.navigate("StoreRoutes", { screen: "ProductTab", params: { storeID } })
          }
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setElements([...products].filter((p) => p.locationID === storeID));
  }, [storeID, products]);

  return (
    <SalesBoxScreen
      defaultValue={defaultValue}
      locationID={storeID}
      elements={elements}
      addElement={addElement}
      onPressEdit={(defaultValue) => {
        navigation.navigate("StoreRoutes", {
          screen: "ProductTab",
          params: { storeID, defaultValue },
        });
      }}
      sendButton={() => navigation.navigate("PreviewOrder", { storeID })}
      buttonsEvent={
        {
          // delivery: () => alert("Para la segunda actualización")
        }
      }
    />
  );
};

export default CreateOrder;
