import React from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthRouteProp, RootAuth, Session } from "domain/entities/navigation";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { useTheme } from "@react-navigation/native";
import { useAppDispatch } from "application/store/hook";
import { changeAll } from "application/store/actions";
import { batch } from "react-redux";
import { active } from "application/slice/user/session.slice";
import apiClient from "infrastructure/api/server";
import { Collection } from "domain/entities/data";
import { login } from "infrastructure/auth/login";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import endpoints from "config/constants/api.endpoints";

interface CardProps extends Session {
  onPress: (selected: string) => void;
}

const Card: React.FC<CardProps> = ({ type, identifier, onPress }) => {
  const { colors } = useTheme();

  return (
    <StyledButton style={styles.button} onPress={() => onPress(identifier)}>
      <Ionicons
        name={type === "user" ? "home-outline" : "people-outline"}
        size={28}
        color={colors.primary}
      />
      <View style={{ marginLeft: 15 }}>
        <StyledText>{type === "user" ? "Mi cuenta" : "Colaborador"}</StyledText>
        <StyledText verySmall style={{ lineHeight: 14 }} color={colors.primary}>
          {identifier}
        </StyledText>
      </View>
    </StyledButton>
  );
};

type SessionProps = {
  navigation: StackNavigationProp<RootAuth>;
  route: AuthRouteProp<"Session">;
};

const SessionScreen: React.FC<SessionProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { connect } = useWebSocketContext();

  const identifier = route.params.identifier;
  const sessions = route.params.sessions;
  const token = route.params.token;

  const user = sessions.find((session) => session.type === "user");
  const collaborators = sessions.filter((session) => session.type === "collaborator");

  const dispatch = useAppDispatch();

  const onPress = async (selected: string) => {
    try {
      await login(identifier, selected, token);

      const res = await apiClient<Partial<Collection>>({
        url: endpoints.user.get(),
        method: "GET",
      });

      batch(() => {
        dispatch(changeAll(res.data));
        dispatch(active());
      });

      const hasCollaborators = (res.data?.collaborators ?? []).length > 0;
      const validation = identifier !== selected || (identifier === selected && hasCollaborators);
      if (validation) await connect();
    } catch (error) {
      Alert.alert("Error", `Hubo un error: ${error}`);
      navigation.pop();
    }
  };

  return (
    <Layout style={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <StyledText center color={colors.primary} subtitle>
          SESIONES
        </StyledText>
        <StyledText>¿A que cuenta deseas acceder?</StyledText>
      </View>
      <View style={{ width: "80%", maxHeight: 400 }}>
        {user ? (
          <Card {...user} onPress={onPress} />
        ) : (
          <StyledButton backgroundColor={colors.primary} onPress={() => onPress(identifier)}>
            <StyledText color="#FFFFFF" center>
              Crear "Mi cuenta"
            </StyledText>
          </StyledButton>
        )}
        <FlatList
          data={collaborators}
          keyExtractor={(item, index) => item.identifier + index.toString()}
          renderItem={({ item }) => <Card {...item} onPress={onPress} />}
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SessionScreen;
