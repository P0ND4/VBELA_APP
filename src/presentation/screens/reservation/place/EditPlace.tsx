import React from "react";
import { View } from "react-native";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import Layout from "presentation/components/layout/Layout";

type CreatePlaceProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"EditPlace">;
};

const EditPlace: React.FC<CreatePlaceProps> = ({ route, navigation }) => {
  return (
    <Layout>
      <View></View>
    </Layout>
  );
};

export default EditPlace;
