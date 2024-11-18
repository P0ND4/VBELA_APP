import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Nomenclature, Zone } from "domain/entities/data/reservations";

export type RootReservation = {
  CreateZone: undefined;
  EditZone: { zone: Zone };
  ZoneInformation: { zoneID: string };
  Place: { zoneID: string };
  PlaceInformation: { zoneID: string; nomenclatureID: string };
  CreatePlace: undefined;
  EditPlace: { place: Nomenclature };
  CreateReservation: undefined;
  ReservationInformation: undefined;
};

export type ReservationNavigationProp = { navigation: StackNavigationProp<RootReservation> };
export type ReservationRouteProp<RouteName extends keyof RootReservation> = RouteProp<
  RootReservation,
  RouteName
>;
