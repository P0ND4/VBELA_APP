import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootSupplier, SupplierRouteProp } from "domain/entities/navigation/root.supplier.entity";
import { Economy } from "domain/entities/data";
import { useAppSelector } from "application/store/hook";
import { Type } from "domain/enums/data/economy/economy.enums";
import { RootApp } from "domain/entities/navigation";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ economy: Economy }> = ({ economy }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() => {
        navigation.navigate("EconomyRoutes", {
          screen: "EconomyInformation",
          params: { economy },
        });
      }}
      onLongPress={() => {
        navigation.navigate("EconomyRoutes", {
          screen: "CreateEconomy",
          params: { economy, type: economy.type },
        });
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name={economy.type === Type.Income ? "arrow-up" : "arrow-down"}
          size={19}
          color={economy.type === Type.Income ? colors.primary : "#f71010"}
        />
        <StyledText style={{ marginLeft: 15 }}>
          {economy.type === Type.Income ? "Ingreso" : "Egreso"}
        </StyledText>
        <StyledText
          style={{ marginLeft: 5 }}
          color={economy.type === Type.Income ? colors.primary : "#f71010"}
        >
          (valor {thousandsSystem(economy.value)})
        </StyledText>
      </View>
      <StyledText color={economy.type === Type.Income ? colors.primary : "#f71010"}>
        {thousandsSystem(economy.quantity)}
      </StyledText>
    </TouchableOpacity>
  );
};

type ButtonProps = {
  condition: boolean;
  onPress: () => void;
  label: string;
};

const FilterButton: React.FC<ButtonProps> = ({ condition, onPress, label }) => {
  const { colors } = useTheme();

  return (
    <StyledButton
      backgroundColor={condition ? colors.primary : colors.card}
      style={styles.movementButtonFilter}
      onPress={onPress}
    >
      <StyledText color={condition ? "#FFFFFF" : colors.text}>{label}</StyledText>
    </StyledButton>
  );
};

type MovementInformationProps = {
  navigation: StackNavigationProp<RootSupplier>;
  route: SupplierRouteProp<"SupplierEconomy">;
};

const SupplierEconomy: React.FC<MovementInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const economies = useAppSelector((state) => state.economies);

  const supplierID = route.params.supplierID;

  const [data, setData] = useState<Economy[]>([]);
  const [type, setType] = useState<Type | null>(null);

  useEffect(() => {
    const found = economies.filter((s) => s.supplier?.id === supplierID);
    if (!found.length) return navigation.pop();
    const data = found.filter((m) => !type || m.type === type);
    setData(data);
  }, [economies, type]);

  const quantity = useMemo(() => data.reduce((a, b) => a + b.quantity, 0), [data]);

  return (
    <Layout style={{ padding: 0 }}>
      {!data.length && (
        <StyledText color={colors.primary} style={{ padding: 20 }}>
          NO HAY MOVIMIENTOS
        </StyledText>
      )}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        style={{ flexGrow: 1 }}
        renderItem={({ item }) => <Card economy={item} />}
      />
      <View style={[styles.row, { padding: 20 }]}>
        <StyledText>
          Cantidad total:{" "}
          <StyledText color={colors.primary}>{thousandsSystem(quantity)}</StyledText>
        </StyledText>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FilterButton
            condition={type === Type.Egress}
            label="Egreso"
            onPress={() => setType(type === Type.Egress ? null : Type.Egress)}
          />
          <FilterButton
            condition={type === Type.Income}
            label="Ingreso"
            onPress={() => setType(type === Type.Income ? null : Type.Income)}
          />
        </View>
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
  card: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  movementButtonFilter: { paddingVertical: 6, marginHorizontal: 2, width: "auto" },
});

export default SupplierEconomy;
