import React, { useEffect } from "react";
import SalesMultiplePaymentScreen from "presentation/screens/common/sales/trade/SalesMultiplePaymentScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStore, StoreRouteProp } from "domain/entities/navigation";
import useSave, { CallbackProps } from "../hooks/useSave";
import { Order, Save } from "domain/entities/data/common";
import { useAppSelector } from "application/store/hook";

type MultiplePaymentProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"MultiplePayment">;
};

const MultiplePayment: React.FC<MultiplePaymentProps> = ({ navigation, route }) => {
  const { save, update } = useSave();

  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const storeID = route.params.storeID;
  const paymentMethod = route.params.paymentMethod;

  useEffect(() => {
    navigation.setOptions({ title: "Pagos multiples" });
  }, []);

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootStore>["navigate"])("StoreRoutes", {
      screen: "OrderCompleted",
      params: { sale: order },
    });
  };

  return (
    <SalesMultiplePaymentScreen
      locationID={storeID}
      paymentMethod={paymentMethod}
      goBack={() => navigation.pop()}
      onSave={(props: Save) => save(props, next)}
      onUpdate={(props: Order) => update(props, next)}
    />
  );
};

export default MultiplePayment;
