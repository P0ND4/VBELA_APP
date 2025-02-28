import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { AppNavigationProp } from "domain/entities/navigation";
import type { Collaborator as CollaboratorType } from "domain/entities/data/collaborators";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";

const Card: React.FC<{ collaborator: CollaboratorType }> = ({ collaborator }) => {
  return <View></View>;
};

const Collaborator: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const collaborators = useAppSelector((state) => state.collaborators);

  const [data, setData] = useState<CollaboratorType[]>(collaborators);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() =>
            navigation.navigate("CollaboratorRoutes", { screen: "CreateCollaborator" })
          }
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    if (!search) return setData(collaborators);
    const searchTerm = search.toLowerCase();
    const filtered = collaborators.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.lastName.toLowerCase().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm),
    );
    setData(filtered);
  }, [collaborators, search]);

  return (
    <Layout style={{ padding: 0 }}>
      <StyledInput
        placeholder="Busca por nombre o correo"
        stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
        stylesInput={{ paddingVertical: 15 }}
        onChangeText={setSearch}
        left={() => <Ionicons name="search" size={25} color={colors.text} />}
      />
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, flex: 1 }}>
        {!data.length ? (
          <StyledText color={colors.primary}>NO HAY COLABORADORES REGISTRADOS</StyledText>
        ) : (
          <FlatList
            data={data}
            contentContainerStyle={{ flexGrow: 1, backgroundColor: "red" }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Card collaborator={item} />}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({});

export default Collaborator;
