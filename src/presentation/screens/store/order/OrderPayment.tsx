import React, { useEffect } from "react";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { Order, PaymentMethod, Save } from "domain/entities/data/common/order.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import SalesPaymentScreen from "presentation/screens/common/sales/trade/SalesPaymentScreen";
import useSave, { CallbackProps } from "../hooks/useSave";
import { useAppSelector } from "application/store/hook";

type OrderPaymentProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"OrderPayment">;
};

const OrderPayment: React.FC<OrderPaymentProps> = ({ navigation, route }) => {
  const { save, update } = useSave();

  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const storeID = route.params.storeID;

  useEffect(() => {
    navigation.setOptions({ title: "Pagar orden" });
  }, []);

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootStore>["navigate"])("StoreRoutes", {
      screen: "OrderCompleted",
      params: { sale: order },
    });
  };

  return (
    <SalesPaymentScreen
      locationID={storeID}
      onSave={(props: Save) => save(props, next)}
      onUpdate={(props: Order) => update(props, next)}
      onMultiplePayment={(paymentMethod: PaymentMethod) => {
        navigation.navigate("MultiplePayment", { paymentMethod, storeID });
      }}
    />
  );
};

export default OrderPayment;
