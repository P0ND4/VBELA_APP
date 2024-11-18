import React from "react";
import { View } from "react-native";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import Layout from "presentation/components/layout/Layout";

type PlaceProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"Place">;
};

const Place: React.FC<PlaceProps> = ({ route, navigation }) => {
  // const zoneID = route.params.zoneID;

  return (
    <Layout>
      <View></View>
    </Layout>
  );
};

export default Place;
