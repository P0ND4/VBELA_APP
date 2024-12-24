import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { Order, PaymentMethod, Save } from "domain/entities/data/common/order.entity";
import { useOrder } from "application/context/OrderContext";
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
  locationID: string;
  tableID?: string;
  paymentMethod: PaymentMethod;
  onSave: (props: Save) => void;
  onUpdate: (order: Order) => void;
  goBack: () => void;
};

const SalesMultiplePaymentScreen: React.FC<SalesMultiplePaymentScreenProps> = ({
  locationID,
  tableID,
  paymentMethod,
  goBack,
  onSave,
  onUpdate,
}) => {
  const { colors } = useTheme();
  const { selection, info, order, clean } = useOrder();

  const [method, setMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => [paymentMethod]);
  const [paymentMethodsVisible, setPaymentMethodsVisible] = useState<boolean>(false);
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);

  const data = (paymentMethods: PaymentMethod[]): Save => ({
    selection,
    status: Status.Completed,
    paymentMethods,
    locationID,
    tableID,
    info,
  });

  const onRemove = (id: string) => {
    const changed = paymentMethods.filter((p) => p.id !== id);
    if (!changed.length) return goBack();
    setPaymentMethods(changed);
  };

  const value = useMemo(() => selection.reduce((a, b) => a + b.total, 0), [selection]);
  const paid = useMemo(() => paymentMethods.reduce((a, b) => a + b.amount, 0), [paymentMethods]);
  const total = useMemo(() => value - value * info.discount, [value, info.discount]);

  const update = (paymentMethods: PaymentMethod[]): void => {
    onUpdate({
      ...order!,
      selection,
      status: Status.Completed,
      paymentMethods,
      paid,
      total,
      discount: info.discount,
      observation: info.observation,
      change: paid > total ? paid - total : 0,
      modificationDate: new Date().toISOString(),
    });
    clean();
  };

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
              if (order) return update(paymentMethods);
              onSave(data(paymentMethods));
              clean();
            }}
          >
            <StyledText center color="#FFFFFF">
              {paid < total ? `Monto faltante: ${thousandsSystem(total - paid)}` : "Completar pago"}
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
