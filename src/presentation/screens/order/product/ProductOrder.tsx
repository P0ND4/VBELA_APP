import React, { useEffect, useState } from "react";
import { useAppSelector } from "application/store/hook";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootApp } from "domain/entities/navigation";
import { Order } from "domain/entities/data/common";
import { Status } from "domain/enums/data/element/status.enums";
import OrdersScreen from "presentation/screens/common/orders/OrdersScreen";

type NavigationProps = StackNavigationProp<RootApp>;

type ProductOrderProps = {
  sales: Order[];
  statusFilter?: Status[];
};

const ProductOrder: React.FC<ProductOrderProps> = ({ sales, statusFilter = [] }) => {
  const stores = useAppSelector((state) => state.stores);

  const [locationFilter, setLocationFilter] = useState<{ label: string; value: string }[]>([]);

  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const data = stores.map((s) => ({ label: s.name, value: s.id }));
    setLocationFilter(data);
  }, [stores]);

  return (
    <OrdersScreen
      orders={sales}
      statusFilter={statusFilter}
      locationFilter={locationFilter}
      navigateToInformation={(order: Order) => {
        navigation.navigate("OrderRoutes", {
          screen: "ProductViewOrder",
          params: { order },
        });
      }}
    />
  );
};

export default ProductOrder;
