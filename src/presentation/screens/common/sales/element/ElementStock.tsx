import React, { useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { RootRestaurant } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { Numeric, Pad } from "presentation/screens/common/NumericPad";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import SalesCard from "../components/SalesCard";

type NavigationProps = StackNavigationProp<RootRestaurant>;

type ModalProps = {
  visible: boolean;
  onClose: () => void;
};

const StockNumericPadModal: React.FC<ModalProps> = ({ visible, onClose }) => {
  return (
    <ScreenModal title="Ejemplo" visible={visible} onClose={onClose}>
      <View style={{ flex: 1, paddingVertical: 20 }}>
        <View style={[styles.center, { flex: 2 }]}>
          <Numeric title="Stock" />
        </View>
        <View style={{ flex: 4 }}>
          <Pad />
        </View>
      </View>
    </ScreenModal>
  );
};

const SalesMinimumStockModal: React.FC<ModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  const [isActivePad, setActivePad] = useState<boolean>(false);

  return (
    <ScreenModal title="Ejemplo" visible={visible} onClose={onClose}>
      <View style={{ flex: 1, paddingVertical: 20 }}>
        <View style={[styles.center, { flex: 2 }]}>
          <Numeric onPress={() => setActivePad(!isActivePad)} />
        </View>
        <View style={{ flex: 4 }}>
          {!isActivePad && (
            <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: "space-between" }}>
              <StyledText justify>
                Los productos o menú con stock igual o menor que el mínimo será destacado en color naranja,
                cómo por ejemplo abajo
              </StyledText>
              <SalesCard style={{ marginTop: 20 }} />
              <StyledButton noMargin backgroundColor={colors.primary}>
                <StyledText center color="#FFFFFF">
                  OK
                </StyledText>
              </StyledButton>
            </View>
          )}
          {isActivePad && <Pad />}
        </View>
      </View>
    </ScreenModal>
  );
};

const ElementStock = () => {
  const { colors } = useTheme();

  const [isActive, setActive] = useState<boolean>(false);
  const [minimunStockModal, setMinimunStockModal] = useState<boolean>(false);
  const [numericPadModal, setNumericPadModal] = useState<boolean>(false);

  const navigation = useNavigation<NavigationProps>();

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View style={styles.row}>
          <StyledText>Controlar stock de producto</StyledText>
          <Switch
            value={isActive}
            onChange={() => setActive(!isActive)}
            thumbColor={isActive ? colors.primary : colors.card}
          />
        </View>
        <Numeric title="Stock" disable={!isActive} onPress={() => setNumericPadModal(true)} />
        <View>
          <StyledButton auto style={styles.row} disable={true}>
            <StyledText>Manejar el stock en inventario</StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          <StyledButton
            style={styles.row}
            disable={!isActive}
            onPress={() => setMinimunStockModal(true)}
          >
            <StyledText>Stock mínimo: 0</StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          <StyledButton backgroundColor={colors.primary} disable={!isActive}>
            <StyledText center color="#FFFFFF">
              Añadir al producto
            </StyledText>
          </StyledButton>
        </View>
      </Layout>
      <SalesMinimumStockModal
        visible={minimunStockModal}
        onClose={() => setMinimunStockModal(false)}
      />
      <StockNumericPadModal visible={numericPadModal} onClose={() => setNumericPadModal(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ElementStock;
