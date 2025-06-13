import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import type { Collaborator as CollaboratorType } from "domain/entities/data/collaborators";
import { useNavigation, useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ collaborator: CollaboratorType }> = ({ collaborator }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <TouchableOpacity
      style={[styles.card, styles.row, { borderColor: colors.border }]}
      onPress={() => {
        navigation.navigate("CollaboratorRoutes", {
          screen: "CollaboratorInformation",
          params: { collaborator },
        });
      }}
      onLongPress={() =>
        navigation.navigate("CollaboratorRoutes", {
          screen: "CreateCollaborator",
          params: { collaborator },
        })
      }
    >
      <View>
        <StyledText>{collaborator.name}</StyledText>
        <StyledText verySmall color={colors.primary}>
          {collaborator.identifier}
        </StyledText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </TouchableOpacity>
  );
};
const Collaborator: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const { identifier } = useAppSelector((state) => state.user);
  const collaborators = useAppSelector((state) => state.collaborators);

  const [data, setData] = useState<CollaboratorType[]>(collaborators);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20, flexDirection: "row", alignItems: "center" }}
          onPress={() =>
            navigation.navigate("CollaboratorRoutes", { screen: "CreateCollaborator" })
          }
        >
          <Ionicons name="add" color={colors.primary} size={20} />
          <StyledText smallParagraph>Colaborador</StyledText>
        </TouchableOpacity>
      ),
    });
  }, []);

  const collaboratorsNoIdentifier = useMemo(
    () => collaborators.filter((c) => c.identifier !== identifier),
    [collaborators],
  );

  useEffect(() => {
    if (!search) return setData(collaboratorsNoIdentifier);
    const searchTerm = search.toLowerCase();
    const filtered = collaboratorsNoIdentifier.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.lastName.toLowerCase().includes(searchTerm) ||
        c.identifier.toLowerCase().includes(searchTerm),
    );
    setData(filtered);
  }, [collaborators, search]);

  return (
    <Layout style={{ padding: 0 }}>
      {!collaboratorsNoIdentifier.length ? (
        <StyledText
          color={colors.primary}
          style={{ paddingHorizontal: 20, paddingVertical: 15, flex: 1 }}
        >
          NO HAY COLABORADORES REGISTRADOS
        </StyledText>
      ) : (
        <>
          <StyledInput
            placeholder="Busca por nombre o correo"
            stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
            stylesInput={{ paddingVertical: 15 }}
            onChangeText={setSearch}
            left={() => <Ionicons name="search" size={25} color={colors.text} />}
          />
          {!data.length && (
            <StyledText color={colors.primary} style={{ margin: 20 }}>
              NO SE ENCONTRARON COLABORADORES
            </StyledText>
          )}
          <FlatList
            data={data}
            contentContainerStyle={{ flexGrow: 1 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Card collaborator={item} />}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
  },
});

export default Collaborator;
