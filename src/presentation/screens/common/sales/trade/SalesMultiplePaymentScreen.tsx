import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { PaymentMethod, Selection } from "domain/entities/data/common/order.entity";
import { useOrder } from "application/context/sales/OrderContext";
import { thousandsSystem } from "shared/utils";
import { Status } from "domain/enums/data/element/status.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import FloorModal from "presentation/components/modal/FloorModal";
import PaymentButtons from "presentation/components/button/PaymentButtons";
import PaymentScreen from "../components/PaymentScreen";

type PaymentMethodsModalProps = {
  visible: boolean;
  onClose: () => void;
  onPress: (id: string) => void;
};

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ visible, onClose, onPress }) => {
  return (
    <FloorModal title="Selecciona el método de pago" visible={visible} onClose={onClose}>
      <PaymentButtons
        onPress={(id) => {
          onPress(id);
          onClose();
        }}
        showPaymentButtonEditing={false}
        containerStyle={{ marginTop: 15 }}
      />
    </FloorModal>
  );
};

type CardProps = {
  paymentMethod: PaymentMethod;
  onRemove: (id: string) => void;
};

const Card: React.FC<CardProps> = ({ paymentMethod, onRemove }) => {
  const { colors } = useTheme();

  const coin = useAppSelector((state) => state.coin);

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={paymentMethod.icon} color={colors.text} size={32} />
        <StyledText style={{ marginHorizontal: 15 }}>{paymentMethod.method}</StyledText>
        <StyledText>
          <StyledText verySmall color={colors.primary}>
            {coin}
          </StyledText>{" "}
          {thousandsSystem(paymentMethod.amount)}
        </StyledText>
      </View>
      <TouchableOpacity onPress={() => onRemove(paymentMethod.id)}>
        <Ionicons name="close-circle-outline" color={colors.text} size={32} />
      </TouchableOpacity>
    </View>
  );
};

type SalesMultiplePaymentScreenProps = {
  paymentMethod: PaymentMethod;
  onSave: (selection: Selection[], paymentMethods: PaymentMethod[], status: string) => void;
  goBack: () => void;
};

const SalesMultiplePaymentScreen: React.FC<SalesMultiplePaymentScreenProps> = ({
  paymentMethod,
  goBack,
  onSave,
}) => {
  const { colors } = useTheme();
  const { selection, info } = useOrder();

  const [method, setMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([paymentMethod]);
  const [paymentMethodsVisible, setPaymentMethodsVisible] = useState<boolean>(false);
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);

  const onRemove = (id: string) => {
    const changed = paymentMethods.filter((p) => p.id !== id);
    if (!changed.length) return goBack();
    setPaymentMethods(changed);
  };

  const paid = paymentMethods.reduce((a, b) => a + b.amount, 0);
  const value = selection.reduce((a, b) => a + b.total, 0);
  const total = value - value * info.discount;

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <FlatList
          data={paymentMethods}
          style={{ flexGrow: 1 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card paymentMethod={item} onRemove={onRemove} />}
        />
        <View style={{ padding: 20 }}>
          <StyledButton
            backgroundColor={colors.primary}
            onPress={() => {
              if (paid < total) return setPaymentMethodsVisible(true);
              onSave(selection, paymentMethods, Status.Completed);
            }}
          >
            <StyledText center color="#FFFFFF">
              {paid < total ? `Monto faltante: ${thousandsSystem(total - paid)}` : "Guardar"}
            </StyledText>
          </StyledButton>
        </View>
      </Layout>
      <PaymentMethodsModal
        visible={paymentMethodsVisible}
        onClose={() => setPaymentMethodsVisible(false)}
        onPress={(id) => {
          setMethod(id);
          setPaymentVisible(true);
        }}
      />
      <PaymentScreen
        method={method}
        visible={paymentVisible}
        total={total - paid}
        onClose={() => setPaymentVisible(false)}
        onSave={(paymentMethod) => {
          setPaymentMethods((prevMethods) =>
            prevMethods.some((p) => p.id === paymentMethod.id)
              ? prevMethods.map((p) =>
                  p.id === paymentMethod.id ? { ...p, amount: p.amount + paymentMethod.amount } : p,
                )
              : [...prevMethods, paymentMethod],
          );
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
});

export default SalesMultiplePaymentScreen;
