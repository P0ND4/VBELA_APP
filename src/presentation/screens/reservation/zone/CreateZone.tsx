import React from "react";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import ZoneFormScreen from "../common/ZoneFormScreen";

type CreateZoneProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"CreateZone">;
};

const CreateZone: React.FC<CreateZoneProps> = ({ route, navigation }) => {
  return <ZoneFormScreen />;
};

export default CreateZone;
