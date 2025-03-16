import { StyleSheet, View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { RootApp } from "domain/entities/navigation";
import { useAppSelector } from "application/store/hook";
import { thousandsSystem } from "shared/utils";
import {
  selectPendingKitchen,
  selectPendingOrders,
  selectPendingSales,
} from "application/selectors";
import Accommodation from "presentation/screens/reservation/Accommodation";
import Restaurant from "presentation/screens/restaurant/Restaurant";
import Store from "presentation/screens/store/Store";
import CustomDrawer from "presentation/components/layout/CustomDrawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import Inventory from "presentation/screens/inventory/Inventory";
import StyledText from "presentation/components/text/StyledText";
import Customer from "presentation/screens/customer/Customer";
import Order from "presentation/screens/order/Order";
import Setting from "presentation/screens/setting/Setting";
import Kitchen from "presentation/screens/kitchen/Kitchen";
import Delivery from "presentation/screens/delivery/Delivery";
import Home from "presentation/screens/Home";
import Statistic from "presentation/screens/statistic/Statistic";
import Collaborator from "presentation/screens/collaborator/Collaborator";
import Supplier from "presentation/screens/supplier/Supplier";
import Payroll from "presentation/screens/payroll/Payroll";
import Economy from "presentation/screens/economy/Economy";

const Drawer = createDrawerNavigator<RootApp>();

function App() {
  const sales = useAppSelector(selectPendingSales);
  const orders = useAppSelector(selectPendingOrders);
  const kitchens = useAppSelector(selectPendingKitchen);

  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        drawerActiveBackgroundColor: colors.background,
        drawerActiveTintColor: colors.text,
        drawerInactiveTintColor: colors.text,
        drawerLabelStyle: {
          marginLeft: -25,
          fontSize: 15,
        },
        drawerItemStyle: { width: "100%", left: -8, borderRadius: 0, paddingHorizontal: 4 },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: "Inicio",
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      {/* <Drawer.Screen
        name="Reservation"
        component={Accommodation}
        options={{
          title: "Alojamiento y reservas",
          drawerIcon: ({ color }) => <Ionicons name="business-outline" size={22} color={color} />,
        }}
      /> */}
      <Drawer.Screen
        name="Statistic"
        component={Statistic}
        options={{
          title: "Estadística",
          unmountOnBlur: true,
          drawerIcon: ({ color }) => <Ionicons name="pie-chart-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Store"
        component={Store}
        options={{
          title: "Tiendas",
          drawerIcon: ({ color }) => <Ionicons name="storefront-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Restaurant"
        component={Restaurant}
        options={{
          title: "Restaurantes/Bars",
          drawerIcon: ({ color }) => <Ionicons name="pricetag-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Order"
        component={Order}
        options={{
          title: "Pedidos",
          drawerIcon: () => (
            <View style={[styles.order, { backgroundColor: colors.primary }]}>
              <StyledText verySmall color="#FFFFFF">
                {thousandsSystem(sales.length + orders.length)}
              </StyledText>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Kitchen"
        component={Kitchen}
        options={{
          title: "Producción",
          drawerIcon: () => (
            <View style={[styles.order, { backgroundColor: colors.primary }]}>
              <StyledText verySmall color="#FFFFFF">
                {thousandsSystem(kitchens.length)}
              </StyledText>
            </View>
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Delivery"
        component={Delivery}
        options={{
          title: "Entregas",
          drawerIcon: ({ color }) => <Ionicons name="location-outline" size={22} color={color} />,
        }}
      /> */}
      {/* <Drawer.Screen
        name="Customer"
        component={Customer}
        options={{
          title: "Clientes",
          drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      /> */}
      <Drawer.Screen
        name="Payroll"
        component={Payroll}
        options={{
          title: "Nómina",
          drawerIcon: ({ color }) => <Ionicons name="newspaper-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Economy"
        component={Economy}
        options={{
          title: "Ingreso/Egreso",
          drawerIcon: ({ color }) => <Ionicons name="card-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Supplier"
        component={Supplier}
        options={{
          title: "Proveedores",
          drawerIcon: ({ color }) => <Ionicons name="albums-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Inventory"
        component={Inventory}
        options={{
          title: "Inventarios",
          drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      {/* <Drawer.Screen
        name="Collaborator"
        component={Collaborator}
        options={{
          title: "Colaboradores",
          drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      /> */}
      <Drawer.Screen
        name="Setting"
        component={Setting}
        options={{
          title: "Preferencias",
          drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  order: { paddingVertical: 2, paddingHorizontal: 10, borderRadius: 12 },
});

export default App;
