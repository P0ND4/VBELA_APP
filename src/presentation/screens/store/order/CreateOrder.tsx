import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Element } from "domain/entities/data/common/element.entity";
import { add } from "application/slice/stores/products.slice";
import apiClient from "infrastructure/api/server";
import { Group } from "domain/entities/data";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import SalesBoxScreen from "presentation/screens/common/sales/trade/SalesBoxScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import endpoints from "config/constants/api.endpoints";

type CreateOrderProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"CreateOrder">;
};

const CreateOrder: React.FC<CreateOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const productGroup = useAppSelector((state) => state.productGroup);
  const products = useAppSelector((state) => state.products);

  const [groups, setGroups] = useState<Group[]>([]);
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
    emit("accessToStore");
  };

  useEffect(() => {
    navigation.setOptions({
      title: "Lista de productos",
      headerRight: () => (
        <TouchableOpacity
          style={styles.create}
          onPress={() =>
            navigation.navigate("StoreRoutes", { screen: "ProductTab", params: { storeID } })
          }
        >
          <Ionicons name="add" color={colors.primary} size={20} />
          <StyledText smallParagraph>Producto</StyledText>
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setElements([...products].filter((p) => p.locationID === storeID));
  }, [storeID, products]);

  useEffect(() => {
    setGroups([...productGroup].filter((m) => m.ownerID === storeID));
  }, [storeID, productGroup]);

  return (
    <SalesBoxScreen
      defaultValue={defaultValue}
      locationID={storeID}
      groups={groups}
      elements={elements}
      addElement={addElement}
      onPressGroup={(group?: Group) => {
        navigation.navigate("StoreRoutes", { screen: "CreateGroup", params: { group, storeID } });
      }}
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

const styles = StyleSheet.create({
  create: {
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CreateOrder;
