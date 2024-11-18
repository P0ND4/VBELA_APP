import React, { useEffect } from "react";
import { RestaurantNavigationProp } from "domain/entities/navigation";
import { PaymentMethod } from "domain/entities/data/common";
import SalesPaymentScreen from "presentation/screens/common/sales/trade/SalesPaymentScreen";
import useSave from "../hooks/saveOrder";

const OrderPayment: React.FC<RestaurantNavigationProp> = ({ navigation }) => {
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
