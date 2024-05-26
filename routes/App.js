import { createDrawerNavigator } from "@react-navigation/drawer";
import { useSelector } from "react-redux";
import Accommodation from "@screens/reservation/Accommodation";
import Statistic from "@screens/statistic/Statistic";
import CreateRoster from "@screens/event/CreateRoster";
import Helper from "@screens/helper/Helper";
import Inventory from "@screens/inventory/Inventory";
import Supplier from "screens/people/supplier/Supplier";
import Customer from "screens/people/customer/Customer";
import Setting from "@screens/setting/Setting";
import Kitchen from "@screens/restaurant/Kitchen";
import Restaurant from "@screens/restaurant/Restaurant";
import Sales from "@screens/salesM/Create";
import CustomDrawer from "@utils/CustomDrawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();
const Drawer = createDrawerNavigator();

function App() {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: mode === "dark" ? dark.main4 : light.textDark,
        headerStyle: {
          backgroundColor: mode === "dark" ? dark.main1 : "#FFFFFF",
        },
        drawerActiveBackgroundColor: light.main2,
        drawerActiveTintColor: light.textDark,
        drawerInactiveTintColor: mode === "dark" ? dark.textWhite : light.textDark,
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: "Roboto-Medium",
          fontSize: 15,
        },
        unmountOnBlur: true,
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
      unmountInactiveRoutes={true}
    >
      {((!helperStatus.active && ["both", "accommodation"].includes(user?.type)) ||
        (helperStatus.active && (helperStatus.accessToTables || helperStatus.accessToReservations))) && (
        <Drawer.Screen
          name="Reservation"
          component={Accommodation}
          options={{
            title: "Alojamiento y reservas",
            drawerIcon: ({ color }) => <Ionicons name="business-outline" size={22} color={color} />,
          }}
        />
      )}
      {(!helperStatus.active || helperStatus.accessToStatistics) && (
        <Drawer.Screen
          name="Statistic"
          component={Statistic}
          options={{
            title: "Estadísticas",
            drawerIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={22} color={color} />,
          }}
        />
      )}
      {!helperStatus.active && (
        <Drawer.Screen
          name="Helper"
          component={Helper}
          options={{
            title: "Equipo de trabajo",
            drawerIcon: ({ color }) => <Ionicons name="recording-outline" size={22} color={color} />,
          }}
        />
      )}
      {((!helperStatus.active && ["both", "sales"].includes(user?.type)) ||
        (helperStatus.active && helperStatus.accessToProductsAndServices)) && (
        <Drawer.Screen
          name="Sales"
          component={Sales}
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ order: undefined, ref: undefined, title: undefined }),
          })}
          options={{
            title: "Venta de Productos&Servicios",
            drawerIcon: ({ color }) => <Ionicons name="layers-outline" size={22} color={color} />,
          }}
        />
      )}
      {((!helperStatus.active && ["both", "sales"].includes(user?.type)) ||
        (helperStatus.active && helperStatus.accessToTables)) && (
        <Drawer.Screen
          name="Tables"
          component={Restaurant}
          options={{
            title: "Restaurante/Bar",
            drawerIcon: ({ color }) => <Ionicons name="pricetag-outline" size={22} color={color} />,
          }}
        />
      )}
      {((!helperStatus.active && ["both", "sales"].includes(user?.type)) ||
        (helperStatus.active && (helperStatus.accessToKitchen || helperStatus.accessToTables))) && (
        <Drawer.Screen
          name="Kitchen"
          component={Kitchen}
          options={{
            title: "Producción",
            drawerIcon: ({ color }) => <Ionicons name="flame-outline" size={22} color={color} />,
          }}
        />
      )}
      {(!helperStatus.active || helperStatus.accessToRoster) && (
        <Drawer.Screen
          name="CreateRoster"
          component={CreateRoster}
          options={{
            title: "Nómina",
            drawerIcon: ({ color }) => <Ionicons name="clipboard-outline" size={22} color={color} />,
          }}
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ editing: false, item: null }),
          })}
        />
      )}
      {(!helperStatus.active || helperStatus.accessToCustomer || helperStatus.accessToTables) && (
        <Drawer.Screen
          name="Customers"
          component={Customer}
          options={{
            title: "Clientes",
            drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
          }}
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
      {((!helperStatus.active && ["both", "sales"].includes(user?.type)) ||
        (helperStatus.active && helperStatus.accessToInventory)) && (
        <Drawer.Screen
          name="Inventory"
          component={Inventory}
          options={{
            title: "Inventario",
            drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
          }}
        />
      )}
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

export default App;
