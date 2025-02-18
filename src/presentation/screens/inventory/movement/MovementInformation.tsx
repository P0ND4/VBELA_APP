import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { changeDate, thousandsSystem } from "shared/utils";
import { removeMovement } from "application/slice/inventories/stocks.slice";
import { useDispatch } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { Movement } from "domain/entities/data/inventories";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import StyledTextInformation from "presentation/components/text/StyledTextInformation";
import Ionicons from "@expo/vector-icons/Ionicons";
import InformationModal from "presentation/components/modal/InformationModal";
import { Type } from "domain/enums/data/inventory/movement.enums";
import { useAppSelector } from "application/store/hook";
import apiClient, { endpoints } from "infrastructure/api/server";

type NavigationProps = StackNavigationProp<RootInventory>;

const MovementCard: React.FC<{ movement: Movement }> = ({ movement }) => {
  const { colors } = useTheme();

  const [informationModal, setInformationModal] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProps>();

  const removeItem = async () => {
    dispatch(removeMovement([movement]));
    await apiClient({
      url: endpoints.stock.deleteMovement(movement.id),
      method: "DELETE",
    });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.border }]}
        onPress={() =>
          navigation.navigate("CreateMovement", {
            movement,
            inventoryID: movement.inventoryID,
            type: movement.type,
          })
        }
        onLongPress={() => setInformationModal(true)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name={movement.type === Type.Entry ? "arrow-up" : "arrow-down"}
            size={19}
            color={movement.type === Type.Entry ? colors.primary : "#f71010"}
          />
          <StyledText style={{ marginLeft: 15 }}>
            {movement.type === Type.Entry ? "Entrada" : "Salida"}
          </StyledText>
        </View>
        <StyledText color={movement.type === Type.Entry ? colors.primary : "#f71010"}>
          {thousandsSystem(movement.quantity)}
        </StyledText>
      </TouchableOpacity>
      <InformationModal
        title="INFORMACIÓN EXTRA"
        animationType="fade"
        headerRight={() => (
          <TouchableOpacity onPress={removeItem}>
            <Ionicons name="trash-outline" color={colors.primary} size={25} />
          </TouchableOpacity>
        )}
        visible={informationModal}
        onClose={() => setInformationModal(false)}
      >
        <StyledTextInformation label="ID" value={movement.id} />
        <StyledTextInformation label="Cantidad" value={thousandsSystem(movement.quantity)} />
        <StyledTextInformation label="Valor" value={thousandsSystem(movement.currentValue)} />
        <StyledTextInformation
          label="Realización"
          value={changeDate(new Date(movement.date), true)}
        />
        <StyledTextInformation
          label="Creación"
          value={changeDate(new Date(movement.creationDate), true)}
        />
        <StyledTextInformation
          label="Modificación"
          value={changeDate(new Date(movement.modificationDate), true)}
        />
      </InformationModal>
    </>
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
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"MovementInformation">;
};

const MovementInformation: React.FC<MovementInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);

  const stockID = route.params.stockID;

  const [data, setData] = useState<Movement[]>([]);
  const [type, setType] = useState<Type | null>(null);

  useEffect(() => {
    const found = stocks.find((s) => s.id === stockID);
    if (!found || !found.movements.length) return navigation.pop();
    const movements = found.movements.filter((m) => !type || m.type === type);
    setData(movements);
  }, [stocks, type]);

  const quantity = data.reduce((a, b) => a + b.quantity, 0);

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
        renderItem={({ item }) => <MovementCard movement={item} />}
      />
      <View style={[styles.row, { padding: 20 }]}>
        <StyledText>
          Cantidad total:{" "}
          <StyledText color={colors.primary}>{thousandsSystem(quantity)}</StyledText>
        </StyledText>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FilterButton
            condition={type === Type.Output}
            label="Salida"
            onPress={() => setType(type === Type.Output ? null : Type.Output)}
          />
          <FilterButton
            condition={type === Type.Entry}
            label="Entrada"
            onPress={() => setType(type === Type.Entry ? null : Type.Entry)}
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

export default MovementInformation;
