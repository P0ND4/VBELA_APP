import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import { changeDate } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import {
  CollaboratorRouteProp,
  RootCollaborator,
} from "domain/entities/navigation/root.collaborator.entity";
import { Collaborator } from "domain/entities/data";
import { remove } from "application/slice/collaborators/collaborators.slice";
import apiClient from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
// import Ionicons from "@expo/vector-icons/Ionicons";
import endpoints from "config/constants/api.endpoints";

const Card: React.FC<{ name: string; value: string }> = ({ name, value }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <StyledText>{name}</StyledText>
      <StyledText color={colors.primary}>{value}</StyledText>
    </View>
  );
};

type SupplierInformationProps = {
  navigation: StackNavigationProp<RootCollaborator>;
  route: CollaboratorRouteProp<"CollaboratorInformation">;
};

const CollaboratorInformation: React.FC<SupplierInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit, disconnect } = useWebSocketContext();

  const collaborators = useAppSelector((state) => state.collaborators);

  const collaborator = route.params.collaborator;

  const [data, setData] = useState<Collaborator>(collaborator);

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `Información: ${data.name}` });
  }, [data]);

  useEffect(() => {
    const found = collaborators.find((s) => s.id === collaborator.id);
    if (!found) navigation.pop();
    else setData(found);
  }, [collaborators, collaborator]);

  const removeData = async () => {
    const filtered = collaborators.filter((c) => c.id !== collaborator.id);
    dispatch(remove({ id: collaborator.id }));
    await apiClient({
      url: endpoints.collaborator.delete(collaborator.id),
      method: "DELETE",
    });
    emit("accessToCollaborator");
    if (!filtered.length) await disconnect();
  };

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <Card name="ID" value={data.id} />
          <Card name="Nombre" value={data.name} />
          {data.identifier && <Card name="Identificador" value={data.identifier} />}
          {data.lastName && <Card name="Apellido" value={data.lastName} />}
          {data.permissions && (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => {}}
            >
              <StyledText>
                Permisos ({Object.keys(data.permissions).length} permisos asignados)
              </StyledText>
              {/* <Ionicons name="chevron-forward" color={colors.text} size={19} /> */}
            </TouchableOpacity>
          )}

          <Card name="Fecha de creación" value={changeDate(new Date(data.creationDate), true)} />
          <Card
            name="Fecha de modificación"
            value={changeDate(new Date(data.modificationDate), true)}
          />
          <TouchableOpacity
            style={[styles.card, { borderColor: colors.border, justifyContent: "center" }]}
            onPress={removeData}
          >
            <StyledText color={colors.primary}>Eliminar</StyledText>
          </TouchableOpacity>
        </ScrollView>
      </Layout>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CollaboratorInformation;
