import React from "react";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import ZoneFormScreen from "../common/ZoneFormScreen";

type CreateZoneProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"EditZone">;
};

const EditZone: React.FC<CreateZoneProps> = ({ route, navigation }) => {
  return <ZoneFormScreen />;
};

export default EditZone;
