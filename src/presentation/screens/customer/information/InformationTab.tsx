import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { CustomerRouteProp, RootCustomer } from "domain/entities/navigation/root.customer.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Customer } from "domain/entities/data/customers";
import { edit, remove } from "application/slice/customers/customers.slice";
import { useTheme } from "@react-navigation/native";
import OrdersScreen from "presentation/screens/common/orders/OrdersScreen";
import CreationForm from "../common/CreationForm";
import Account from "./Account";
import Ionicons from "@expo/vector-icons/Ionicons";

const Tab = createMaterialTopTabNavigator();

type InformationTabProps = {
  navigation: StackNavigationProp<RootCustomer>;
  route: CustomerRouteProp<"CustomerInformation">;
};

const InformationTab: React.FC<InformationTabProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const customers = useAppSelector((state) => state.customers);

  const customer = route.params.customer;
  const [data, setData] = useState<Customer>(customer);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const data = customers.find((c) => c.id === customer.id);
    if (!data) return navigation.pop();
    setData(data);

    navigation.setOptions({
      title: customer.name,
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => {
            dispatch(remove({ id: customer.id }));
            navigation.pop();
          }}
        >
          <Ionicons name="trash-outline" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, [customers]);

  const update = (data: Customer) => {
    dispatch(edit(data));
    Alert.alert("Guardado", "La información ha sido actualizada");
  };

  return (
    <Tab.Navigator>
      <Tab.Screen name="DATOS">
        {(props) => (
          <CreationForm
            {...props}
            defaultValue={customer}
            disable={{ switchAgency: true, switchContact: true }}
            onSubmit={update}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="VENTAS">
        {(props) => (
          <OrdersScreen
            {...props}
            orders={[]}
            navigateToInformation={() => {
              // navigation.navigate("OrderRoutes", {
              //   screen: "MenuViewOrder",
              //   params: { id },
              // });
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="PEDIDOS">
        {(props) => (
          <OrdersScreen
            {...props}
            orders={[]}
            navigateToInformation={() => {
              // navigation.navigate("OrderRoutes", {
              //   screen: "MenuViewOrder",
              //   params: { id },
              // });
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="CUENTA">{(props) => <Account {...props} customer={data} />}</Tab.Screen>
    </Tab.Navigator>
  );
};

export default InformationTab;
