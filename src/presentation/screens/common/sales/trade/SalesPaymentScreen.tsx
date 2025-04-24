import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useOrder } from "application/context/OrderContext";
import { thousandsSystem } from "shared/utils";
import { Order, PaymentMethod, Save } from "domain/entities/data/common/order.entity";
import { Status } from "domain/enums/data/element/status.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import PaymentButtons from "presentation/components/button/PaymentButtons";
import PaymentScreen from "../components/PaymentScreen";

type SalesPaymentScreenProps = {
  locationID: string;
  tableID?: string;
  onSave: (props: Save) => void;
  onUpdate: (order: Order) => void;
  onMultiplePayment: (paymentMethod: PaymentMethod) => void;
};

const SalesPaymentScreen: React.FC<SalesPaymentScreenProps> = ({
  onSave,
  onUpdate,
  onMultiplePayment,
  locationID,
  tableID,
}) => {
  const { colors } = useTheme();
  const { info, selection, order, clean } = useOrder();

  const [method, setMethod] = useState<string>("");
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const value = useMemo(() => selection.reduce((a, b) => a + b.total, 0), [selection]);
  const totalWithoutTaxTip = useMemo(() => value - value * info.discount, [value, info.discount]);
  const total = useMemo(
    () => totalWithoutTaxTip + info.tip + totalWithoutTaxTip * info.tax,
    [totalWithoutTaxTip, info.discount, info.tax, info.tip],
  );

  const data = (status: Status, paymentMethods: PaymentMethod[]): Save => ({
    selection,
    status,
    paymentMethods,
    locationID,
    tableID,
    info,
  });

  const update = (status?: Status, paymentMethods: PaymentMethod[] = []) => {
    const paid = paymentMethods.reduce((a, b) => a + b.amount, 0);

    onUpdate({
      ...order!,
      selection,
      status: status || order!.status,
      paymentMethods,
      tip: info.tip,
      tax: info.tax,
      paid,
      total,
      discount: info.discount,
      observation: info.observation,
      change: paid > total ? paid - total : 0,
      modificationDate: new Date().getTime(),
    });

    clean();
  };

  const handleSave = useCallback(() => {
    setLoading(true);
    if (order) return update();
    onSave(data(Status.Pending, []));
    clean();
  }, [selection, locationID, tableID, info, onSave, update]);

  const handlePaymentSave = useCallback(
    (paymentMethod: PaymentMethod) => {
      const { amount } = paymentMethod;
      if (amount < total) return onMultiplePayment(paymentMethod);
      setLoading(true);
      if (order) return update(Status.Completed, [paymentMethod]);
      onSave(data(Status.Completed, [paymentMethod]));
      clean();
    },
    [total, selection, locationID, tableID, info, onSave, onMultiplePayment, update],
  );

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View style={styles.information}>
          <View style={styles.row}>
            <StyledText bigTitle center>
              {thousandsSystem(!total ? "GRATIS" : total)}
            </StyledText>
          </View>
          <View style={styles.buttonContainer}>
            <StyledButton auto onPress={handleSave}>
              <StyledText>Guardar pedido</StyledText>
            </StyledButton>
            {/* <StyledButton
              auto
              backgroundColor={colors.primary}
              onPress={() => alert("Para la tercera actualización")}
            >
              <StyledText color="#FFFFFF">Pagar a crédito</StyledText>
            </StyledButton> */}
          </View>
        </View>
        <View style={{ flex: 2 }}>
          <PaymentButtons onPress={(id) => setMethod(id === method ? "" : id)} selected={method} />
          <StyledButton
            backgroundColor={colors.primary}
            disable={!method && !!total}
            loading={loading}
            onPress={() => {
              if (!method) {
                setLoading(true);
                if (order) return update(Status.Completed, []);
                else onSave(data(Status.Completed, []));
                clean();
              } else setPaymentVisible(true);
            }}
          >
            <StyledText center color="#FFFFFF">
              Avanzar
            </StyledText>
          </StyledButton>
        </View>
      </Layout>

      <PaymentScreen
        method={method}
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        onSave={handlePaymentSave}
        total={total}
      />
    </>
  );
};

const styles = StyleSheet.create({
  information: { flex: 3, justifyContent: "center", alignItems: "center" },
  buttonContainer: {
    marginTop: 10,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  row: { flexDirection: "row", alignItems: "center" },
});

export default SalesPaymentScreen;
