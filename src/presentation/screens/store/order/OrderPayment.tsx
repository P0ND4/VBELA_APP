import React, { useEffect } from "react";
import { StoreNavigationProp } from "domain/entities/navigation/route.store.entity";
import { PaymentMethod } from "domain/entities/data/common/order.entity";
import SalesPaymentScreen from "presentation/screens/common/sales/trade/SalesPaymentScreen";
import useSave from "../hooks/saveOrder";

const OrderPayment: React.FC<StoreNavigationProp> = ({ navigation }) => {
  const { save } = useSave();

  useEffect(() => {
    navigation.setOptions({ title: "Pagar orden" });
  }, []);

  return (
    <SalesPaymentScreen
      onSave={save}
      onMultiplePayment={(paymentMethod: PaymentMethod) => {
        navigation.navigate("MultiplePayment", { paymentMethod });
      }}
    />
  );
};

export default OrderPayment;
