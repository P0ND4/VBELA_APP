import React from "react";
import { View } from "react-native";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import Layout from "presentation/components/layout/Layout";

type CreatePlaceProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"CreatePlace">;
};

const CreatePlace: React.FC<CreatePlaceProps> = ({ route, navigation }) => {
  // const zoneID = route.params.zoneID;

  return (
    <Layout>
      <View></View>
    </Layout>
  );
};

export default CreatePlace;
