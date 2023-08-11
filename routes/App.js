import { createDrawerNavigator } from "@react-navigation/drawer";
import { useSelector } from "react-redux";
import Home from "@screens/Home";
import Statistic from "@screens/Statistic";
import CreateRoster from "@screens/event/CreateRoster";
import Helper from "@screens/helper/Helper";
import Inventory from "@screens/inventory/Inventory";
import People from "@screens/people/People";
import Setting from "@screens/setting/Setting";
import Kitchen from "@screens/table/Kitchen";
import Tables from "@screens/table/Tables";
import CustomDrawer from "@components/CustomDrawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const dark = theme.colors.dark;
const light = theme.colors.light;

const Drawer = createDrawerNavigator();

function App() {
  const mode = useSelector((state) => state.mode);

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
        drawerInactiveTintColor:
          mode === "dark" ? dark.textWhite : light.textDark,
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: "Roboto-Medium",
          fontSize: 15,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: "Inicio",
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
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
      <Drawer.Screen
        name="Helper"
        component={Helper}
        options={{
          title: "Grupos",
          drawerIcon: ({ color }) => (
            <Ionicons name="recording-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Tables"
        component={Tables}
        options={{
          title: "Ventas",
          drawerIcon: ({ color }) => (
            <Ionicons name="pricetag-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Kitchen"
        component={Kitchen}
        options={{
          title: "Cocina",
          drawerIcon: ({ color }) => (
            <Ionicons name="flame-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CreateRoster"
        component={CreateRoster}
        options={{
          title: "Nómina",
          drawerIcon: ({ color }) => (
            <Ionicons name="clipboard-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Customers"
        options={{
          title: "Clientes",
          drawerIcon: ({ color }) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      >
        {(props) => <People {...props} userType="customer" />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Providers"
        options={{
          title: "Proveedores",
          drawerIcon: ({ color }) => (
            <Ionicons name="cube-outline" size={22} color={color} />
          ),
        }}
      >
        {(props) => <People {...props} userType="supplier" />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Inventory"
        component={Inventory}
        options={{
          title: "Inventario",
          drawerIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Setting"
        component={Setting}
        options={{
          title: "Preferencias",
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default App;
