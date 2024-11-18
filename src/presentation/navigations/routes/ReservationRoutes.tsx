import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootReservation } from "domain/entities/navigation";
import CreateZone from "presentation/screens/reservation/zone/CreateZone";
import ZoneInformation from "presentation/screens/reservation/zone/ZoneInformation";
import PlaceInformation from "presentation/screens/reservation/place/PlaceInformation";
import EditZone from "presentation/screens/reservation/zone/EditZone";
import CreatePlace from "presentation/screens/reservation/place/CreatePlace";
import EditPlace from "presentation/screens/reservation/place/EditPlace";
import Place from "presentation/screens/reservation/place/Place";

const Stack = createStackNavigator<RootReservation>();

const ReservationRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateZone" component={CreateZone} />
      <Stack.Screen name="EditZone" component={EditZone} />
      <Stack.Screen name="ZoneInformation" component={ZoneInformation} />

      <Stack.Screen name="Place" component={Place} />
      <Stack.Screen name="CreatePlace" component={CreatePlace} />
      <Stack.Screen name="EditPlace" component={EditPlace} />
      <Stack.Screen name="PlaceInformation" component={PlaceInformation} />
    </Stack.Navigator>
  );
};

export default ReservationRoutes;
