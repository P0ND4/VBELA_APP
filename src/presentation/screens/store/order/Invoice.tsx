import React, { useEffect } from "react";
import SalesInvoiceScreen from "presentation/screens/common/sales/trade/SalesInvoiceScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp, RootStore, StoreRouteProp } from "domain/entities/navigation";

type InvoiceProps = {
  navigation: StackNavigationProp<RootStore & RootApp>;
  route: StoreRouteProp<"Invoice">;
};

const Invoice: React.FC<InvoiceProps> = ({ navigation, route }) => {
  const sale = route.params.sale;

  useEffect(() => {
    navigation.setOptions({ title: "Factura" });
  }, []);

  return (
    <SalesInvoiceScreen
      trade={sale}
      goEdit={() => navigation.navigate("SettingRoutes", { screen: "Invoice" })}
    />
  );
};

export default Invoice;
