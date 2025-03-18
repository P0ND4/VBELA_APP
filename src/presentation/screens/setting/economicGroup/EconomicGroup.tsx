import React, { useEffect } from "react";
import { TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import { RootSetting, SettingNavigationProp } from "domain/entities/navigation/root.setting.entity";
import { EconomicGroup as EconomicGroupType } from "domain/entities/data";
import { StackNavigationProp } from "@react-navigation/stack";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

type NavigationProps = StackNavigationProp<RootSetting>;

const Card: React.FC<{ item: EconomicGroupType }> = ({ item }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() => navigation.navigate("CreateEconomicGroup", { defaultValue: item })}
    >
      <StyledText>{item.name}</StyledText>
      <StyledText color={colors.primary}>({item.visible.toUpperCase()})</StyledText>
    </TouchableOpacity>
  );
};

const EconomicGroup: React.FC<SettingNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const economicGroup = useAppSelector((state) => state.economicGroup);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => navigation.navigate("CreateEconomicGroup")}
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <Layout style={{ padding: 0 }}>
      {!economicGroup.length ? (
        <StyledText color={colors.primary} style={{ margin: 20 }}>
          NO HAY CATEGORÍA DE INGRESO/EGRESO REGISTRADOS
        </StyledText>
      ) : (
        <FlatList
          data={economicGroup}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} />}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default EconomicGroup;
