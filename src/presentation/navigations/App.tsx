import { StyleSheet, View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { RootApp } from "domain/entities/navigation";
import { useAppSelector } from "application/store/hook";
import { thousandsSystem } from "shared/utils";
import { selectPendingOrders, selectPendingSales } from "application/selectors";
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

const Drawer = createDrawerNavigator<RootApp>();

function App() {
  const sales = useAppSelector(selectPendingSales);
  const orders = useAppSelector(selectPendingOrders);

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
      {/* <Drawer.Screen
        name="Reservation"
        component={Accommodation}
        options={{
          title: "Alojamiento y reservas",
          drawerIcon: ({ color }) => <Ionicons name="business-outline" size={22} color={color} />,
        }}
      /> */}
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
      {/* <Drawer.Screen
        name="Order"
        component={Order}
        options={{
          title: "Pedidos",
          drawerIcon: ({ color }) => (
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
        component={Store}
        options={{
          title: "Producción",
          drawerIcon: ({ color }) => <Ionicons name="flame-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Delivery"
        component={Store}
        options={{
          title: "Entregas",
          drawerIcon: ({ color }) => <Ionicons name="location-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Customer"
        component={Customer}
        options={{
          title: "Clientes",
          drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Inventory"
        component={Inventory}
        options={{
          title: "Inventarios",
          drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
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

      {/* {(!helperStatus.active || helperStatus.accessToStatistics) && (
        <Drawer.Screen
          name="Statistic"
          component={Statistic}
          options={{
            title: "Estadísticas",
            drawerIcon: ({ color }) => (
              <Ionicons name="stats-chart-outline" size={22} color={color} />
            ),
          }}
        />
      )}
      {!helperStatus.active && (
        <Drawer.Screen
          name="Helper"
          component={Helper}
          options={{
            title: "Equipo de trabajo",
            drawerIcon: ({ color }) => (
              <Ionicons name="recording-outline" size={22} color={color} />
            ),
          }}
        />
      )}
      {(!helperStatus.active || helperStatus.accessToRoster) && (
        <Drawer.Screen
          name="CreateRoster"
          component={CreateRoster}
          options={{
            title: "Nómina",
            drawerIcon: ({ color }) => (
              <Ionicons name="clipboard-outline" size={22} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ editing: false, item: null }),
          })}
        />
      )}
      {(!helperStatus.active || helperStatus.accessToSupplier) && (
        <Drawer.Screen
          name="Providers"
          component={Supplier}
          options={{
            title: "Proveedores",
            drawerIcon: ({ color }) => <Ionicons name="cube-outline" size={22} color={color} />,
          }}
        />
      )}
      */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  order: { paddingVertical: 2, paddingHorizontal: 10, borderRadius: 12 },
});

export default App;
