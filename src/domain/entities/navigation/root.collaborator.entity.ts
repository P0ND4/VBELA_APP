import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Collaborator } from "../data/collaborators";

export type RootCollaborator = {
  CreateCollaborator: { collaborator?: Collaborator };
  CollaboratorInformation: { collaborator: Collaborator };
};

export type CollaboratorNavigationProp = { navigation: StackNavigationProp<RootCollaborator> };
export type CollaboratorRouteProp<RouteName extends keyof RootCollaborator> = RouteProp<
  RootCollaborator,
  RouteName
>;
