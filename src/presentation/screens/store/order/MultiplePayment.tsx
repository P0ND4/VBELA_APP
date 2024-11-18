import React, { useEffect } from "react";
import SalesMultiplePaymentScreen from "presentation/screens/common/sales/trade/SalesMultiplePaymentScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStore, StoreRouteProp } from "domain/entities/navigation";
import useSave from "../hooks/saveOrder";

type MultiplePaymentProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"MultiplePayment">;
};

const MultiplePayment: React.FC<MultiplePaymentProps> = ({ navigation, route }) => {
  const { save } = useSave();

  const paymentMethod = route.params.paymentMethod;

  useEffect(() => {
    navigation.setOptions({ title: "Pagos multiples" });
  }, []);

  return (
    <SalesMultiplePaymentScreen
      paymentMethod={paymentMethod}
      goBack={() => navigation.pop()}
      onSave={save}
    />
  );
};

export default MultiplePayment;
