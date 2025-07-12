import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { selectEntry, selectOutput } from "application/selectors/movements.selector";
import { Movement as MovementType } from "domain/entities/data";
import StyledText from "presentation/components/text/StyledText";
import Layout from "presentation/components/layout/Layout";
import FullFilterDate, {
  DateType,
  filterByDate,
  resetDate,
} from "presentation/components/layout/FullFilterDate";
import StyledButton from "presentation/components/button/StyledButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { useNavigation, useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Type as MovementEnums } from "domain/enums/data/inventory/movement.enums";
import Table from "presentation/components/layout/Table";

type MovementProps = {
  inventoryID: string;
  visualization: "block" | "table";
};

const Tab = createMaterialTopTabNavigator();

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ movement: MovementType }> = ({ movement }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  const validation = ["COMPRA", "VENTA"].some((d) => d === movement.reason);

  return (
    <StyledButton
      style={styles.row}
      onPress={() =>
        navigation.navigate("InventoryRoutes", {
          screen: "MovementInformation",
          params: { stockID: movement.stock.id },
        })
      }
      onLongPress={() => {
        navigation.navigate("InventoryRoutes", {
          screen: "CreateMovement",
          params: {
            movement,
            inventoryID: movement.inventory.id,
            type: movement.type,
          },
        });
      }}
    >
      <View>
        <StyledText
          ellipsizeMode="tail"
          numberOfLines={1}
          color={validation ? colors.text : "#f71010"}
        >
          {movement.stock.name} {movement.stock.unit && `(${movement.stock.unit})`}
        </StyledText>
        <StyledText color={validation ? colors.primary : "#f71010"}>{movement.reason}</StyledText>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <StyledText bold color={validation ? colors.text : "#f71010"}>
          {thousandsSystem(movement.quantity)}
        </StyledText>
        <StyledText
          verySmall
          color={movement.type === MovementEnums.Entry && validation ? colors.primary : "#f71010"}
        >
          {thousandsSystem(movement.currentValue * movement.quantity)}
        </StyledText>
      </View>
    </StyledButton>
  );
};

type MovementScreenProps = {
  movements: MovementType[];
  visualization: "block" | "table";
};

const MovementScreen: React.FC<MovementScreenProps> = ({ movements, visualization }) => {
  const { colors } = useTheme();

  const [date, setDate] = useState<DateType>(resetDate);

  const data: MovementType[] = useMemo(
    () => filterByDate<MovementType>(movements, date),
    [movements, date],
  );

  return (
    <Layout style={{ padding: 0 }}>
      {!movements.length ? (
        <StyledText color={colors.primary} style={{ padding: 20 }}>
          NO HAY MOVIMIENTOS EN ESTE ESTADO
        </StyledText>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <FullFilterDate date={date} setDate={setDate} style={{ paddingVertical: 10 }} />
          {!data.length && (
            <StyledText color={colors.primary}>NO HAY MOVIMIENTOS PARA LA BÚSQUEDA</StyledText>
          )}
          {!!data.length && (
            <>
              {visualization === "block" ? (
                <FlatList
                  data={data}
                  style={{ flexGrow: 1 }}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <Card movement={item} />}
                />
              ) : (
                <Table full containerStyle={{ marginVertical: 4 }}>
                  <Table.Header
                    data={[
                      { text: "Producto", style: { width: 150 } },
                      "Cantidad/Und",
                      "Motivo",
                      "Valor",
                    ]}
                  >
                    {data.map((data) => {
                      const validation = ["COMPRA", "VENTA"].some((d) => d === data.reason);

                      return (
                        <Table.Body
                          key={data.id}
                          onPressCompleteData={true}
                          cellColor={validation ? colors.text : "#f71010"}
                          data={[
                            { text: data.stock.name, style: { width: 150 } },
                            `${thousandsSystem(data.quantity)}${data.stock.unit && `/${data.stock.unit}`}`,
                            data.reason,
                            thousandsSystem(data.currentValue * data.quantity),
                          ]}
                        />
                      );
                    })}
                  </Table.Header>
                </Table>
              )}
            </>
          )}
        </View>
      )}
    </Layout>
  );
};

const Movement: React.FC<MovementProps> = ({ inventoryID, visualization }) => {
  const movements = useAppSelector((state) => state.movements);
  const entry = useAppSelector(selectEntry);
  const output = useAppSelector(selectOutput);

  const condition = (m: MovementType) => m.inventory.id === inventoryID;

  const movementsFiltered = useMemo(() => movements.filter(condition), [movements]);
  const entryFiltered = useMemo(() => entry.filter(condition), [entry]);
  const outputFiltered = useMemo(() => output.filter(condition), [output]);

  return (
    <Tab.Navigator screenOptions={{ tabBarLabelStyle: { fontSize: 12 } }}>
      <Tab.Screen name="TODO">
        {() => <MovementScreen movements={movementsFiltered} visualization={visualization} />}
      </Tab.Screen>
      <Tab.Screen name="ENTRADA">
        {() => <MovementScreen movements={entryFiltered} visualization={visualization} />}
      </Tab.Screen>
      <Tab.Screen name="SALIDA">
        {() => <MovementScreen movements={outputFiltered} visualization={visualization} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Movement;
