import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootCollaborator } from "domain/entities/navigation/root.collaborator.entity";
import CreateCollaborator from "presentation/screens/collaborator/CreateCollaborator";

const Stack = createStackNavigator<RootCollaborator>();

const CollaboratorRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateCollaborator" component={CreateCollaborator} />
    </Stack.Navigator>
  );
};

export default CollaboratorRoutes;
