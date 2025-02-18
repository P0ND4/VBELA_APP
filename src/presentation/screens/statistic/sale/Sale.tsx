import React, { useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { RootStatistics, StatisticsRouteProp } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import ProductOrder from "presentation/screens/order/product/ProductOrder";
import MenuOrder from "presentation/screens/order/menu/MenuOrder";

const Tab = createMaterialTopTabNavigator();

type SaleProps = {
  navigation: StackNavigationProp<RootStatistics>;
  route: StatisticsRouteProp<"Sale">;
};

const Sale: React.FC<SaleProps> = ({ navigation, route }) => {
  const sales = route.params.sales;
  const orders = route.params.orders;
  const title = route.params.title;

  useEffect(() => {
    navigation.setOptions({ title });
  }, [title]);

  return (
    <Tab.Navigator>
      <Tab.Screen name="PEDIDOS">{() => <ProductOrder sales={sales} />}</Tab.Screen>
      <Tab.Screen name="MENÚ">{() => <MenuOrder orders={orders} />}</Tab.Screen>
    </Tab.Navigator>
  );
};

export default Sale;
