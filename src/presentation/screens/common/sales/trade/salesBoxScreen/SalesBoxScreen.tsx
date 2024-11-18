import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Element } from "domain/entities/data/common/element.entity";
import { useOrder } from "application/context/sales/OrderContext";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import SalesButtonBottom from "../../components/SalesButtonBottom";
import CountScreen from "../../components/CountScreen";
import Card from "./Card";
import UnregisteredModal from "./UnregisteredModal";
import FilterModal from "./FilterModal";

type SalesBoxScreenProps = {
  elements: Element[];
  sendButton: () => void;
  addElement: (data: Element) => void;
  onPressEdit: (data: Element) => void;
  locationID: string;
  buttonsEvent: {
    delivery?: () => void;
    kitchen?: () => void;
  };
};

const SalesBoxScreen: React.FC<SalesBoxScreenProps> = ({
  elements,
  locationID,
  sendButton = () => {},
  onPressEdit = () => {},
  addElement = () => {},
  buttonsEvent = {},
}) => {
  const { colors } = useTheme();
  const { selection, addSelection, clean } = useOrder();

  const [countModal, setCountModal] = useState<boolean>(false);
  const [unregisteredModal, setUnregisteredModal] = useState<boolean>(false);
  const [filterModal, setFilterModal] = useState<boolean>(false);

  const [count, setCount] = useState<number>(1);
  const [data, setData] = useState<Element[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const sort = [...elements].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0));

    if (search) {
      const filtered = sort.filter((s) => {});
      setData(filtered);
    } else setData(sort);
  }, [elements, search]);

  return (
    <>
      <Layout>
        {!elements.length ? (
          <StyledText color={colors.primary}>NO HAY ELEMENTOS REGISTRADOS</StyledText>
        ) : (
          <>
            <View style={styles.row}>
              <StyledInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre"
              />
              <View style={{ flexDirection: "row", marginLeft: 8 }}>
                <StyledButton
                  style={styles.headerButton}
                  onPress={() => {
                    alert("Para la tercera actualización");
                    // setFilterModal(true)
                  }}
                >
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                </StyledButton>
                <StyledButton
                  style={[{ marginHorizontal: 8, width: "auto" }, styles.headerButton]}
                  onPress={() => setUnregisteredModal(true)}
                >
                  <Ionicons name="flash-outline" size={20} color={colors.primary} />
                </StyledButton>
                <StyledButton style={styles.headerButton} onPress={() => setCountModal(true)}>
                  <StyledText>{thousandsSystem(count)}x</StyledText>
                </StyledButton>
              </View>
            </View>
            {!data.length && (
              <StyledText color={colors.primary} style={{ marginTop: 8 }}>
                NO SE ENCONTRARON RESULTADOS
              </StyledText>
            )}
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card
                  item={item}
                  onPressEdit={onPressEdit}
                  onPress={() => addSelection(item, true, count)}
                />
              )}
              style={{ marginTop: 8 }}
            />
            <SalesButtonBottom
              onPress={() => {
                if (!selection.length)
                  return Alert.alert("OOPS!", "No hay elementos seleccionados");
                sendButton();
              }}
              name={
                !selection.length
                  ? "Ningún pedido registrado"
                  : `(${selection.reduce((a, b) => a + b.quantity, 0)}) Seleccionado`
              }
              buttonsEvent={{ ...buttonsEvent }}
            />
          </>
        )}
      </Layout>
      <CountScreen
        defaultValue={count}
        visible={countModal}
        onClose={() => setCountModal(false)}
        onSave={(value) => setCount(value)}
      />
      <UnregisteredModal
        locationID={locationID}
        visible={unregisteredModal}
        onClose={() => setUnregisteredModal(false)}
        onSave={(item, register) => {
          register && addElement(item);
          addSelection(item, register, count);
        }}
      />
      <FilterModal visible={filterModal} onClose={() => setFilterModal(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButton: {
    paddingHorizontal: 14,
    width: "auto",
  },
});

export default SalesBoxScreen;
