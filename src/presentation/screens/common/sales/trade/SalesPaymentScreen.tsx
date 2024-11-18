import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useOrder } from "application/context/sales/OrderContext";
import { thousandsSystem } from "shared/utils";
import { useAppSelector } from "application/store/hook";
import { PaymentMethod, Selection } from "domain/entities/data/common/order.entity";
import { Status } from "domain/enums/data/element/status.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import PaymentButtons from "presentation/components/button/PaymentButtons";
import PaymentScreen from "../components/PaymentScreen";

type SalesPaymentScreenProps = {
  onSave: (selection: Selection[], paymentMethods: PaymentMethod[], status: string) => void;
  onMultiplePayment: (paymentMethod: PaymentMethod) => void;
};

const SalesPaymentScreen: React.FC<SalesPaymentScreenProps> = ({ onSave, onMultiplePayment }) => {
  const { colors } = useTheme();

  const { info, selection } = useOrder();

  const [method, setMethod] = useState<string>("");
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);

  const coin = useAppSelector((state) => state.coin);

  const value = selection.reduce((a, b) => a + b.total, 0);
  const total = value - value * info.discount;

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View style={styles.information}>
          <View style={{ flexDirection: "row" }}>
            <StyledText style={{ marginTop: 8, marginRight: 6 }}>{coin}</StyledText>
            <StyledText bigTitle center>
              {thousandsSystem(total)}
            </StyledText>
          </View>
          <View style={styles.buttonContainer}>
            <StyledButton auto onPress={() => onSave(selection, [], Status.Pending)}>
              <StyledText>Guardar pedido</StyledText>
            </StyledButton>
            <StyledButton
              auto
              backgroundColor={colors.primary}
              onPress={() => alert("Para la tercera actualización")}
            >
              <StyledText color="#FFFFFF">Pagar a crédito</StyledText>
            </StyledButton>
          </View>
        </View>
        <View style={{ flex: 2 }}>
          <PaymentButtons onPress={(id) => setMethod(id === method ? "" : id)} selected={method} />
          <StyledButton
            backgroundColor={colors.primary}
            disable={!method}
            onPress={() => setPaymentVisible(true)}
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
        onSave={(paymentMethod) => {
          if (paymentMethod.amount >= total) onSave(selection, [paymentMethod], Status.Completed);
          else onMultiplePayment(paymentMethod);
        }}
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
});

export default SalesPaymentScreen;
