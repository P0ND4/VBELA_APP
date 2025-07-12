import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { Economy } from "domain/entities/data";
import { Type } from "domain/enums/data/economy/economy.enums";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import { thousandsSystem } from "shared/utils";
import { EconomyRouteProp, RootEconomy } from "domain/entities/navigation/root.economy.entity";
import { useEconomyData } from "./hooks/useEconomyData";

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ economy: Economy; detail: boolean }> = ({ economy, detail }) => {
  const { colors } = useTheme();

  const path = useMemo(
    () =>
      [economy.type, economy.category.name, economy.subcategory?.name].filter(Boolean).join("/"),
    [economy],
  );

  const navigation = useNavigation<NavigationProps>();

  return (
    <StyledButton
      style={[styles.row, { opacity: !economy.isSpecial ? 1 : 0.6 }]}
      onPress={() => {
        navigation.navigate("EconomyRoutes", {
          screen: "EconomyInformation",
          params: { economy },
        });
      }}
      onLongPress={() => {
        if (!economy.isSpecial) {
          navigation.navigate("EconomyRoutes", {
            screen: "CreateEconomy",
            params: { economy, type: economy.type },
          });
        }
      }}
    >
      <StyledText ellipsizeMode="tail" numberOfLines={1}>
        {detail ? path : economy.category.name}
      </StyledText>
      <StyledText color={economy.type === Type.Income ? colors.primary : "#f71010"}>
        ({thousandsSystem(economy.quantity)}) {thousandsSystem(economy.value)}
      </StyledText>
    </StyledButton>
  );
};

type GroupInformationProps = {
  navigation: StackNavigationProp<RootEconomy>;
  route: EconomyRouteProp<"GroupInformation">;
};

const GroupInformation: React.FC<GroupInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { all } = useEconomyData();

  const economies = route.params.economies;

  const [isDetail, setDetail] = useState<boolean>(false);
  const [data, setData] = useState<Economy[]>(economies);

  useEffect(() => {
    navigation.setOptions({
      title: `Información de grupo: ${data[0]?.category.name.toUpperCase()}`,
    });
  }, [data]);

  useEffect(() => {
    const data = all.filter((a) => economies.some((e) => e.id === a.id));
    if (!data) navigation.pop();
    else setData(data);
  }, [all]);

  return (
    <Layout>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Card economy={item} detail={isDetail} />}
      />
      <View style={styles.features}>
        <StyledButton
          style={{ marginRight: 5, width: "auto" }}
          backgroundColor={isDetail ? colors.primary : colors.card}
          onPress={() => setDetail(!isDetail)}
        >
          <StyledText smallParagraph color={isDetail ? "#FFFFFF" : colors.text}>
            Detalles
          </StyledText>
        </StyledButton>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  features: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

export default GroupInformation;
