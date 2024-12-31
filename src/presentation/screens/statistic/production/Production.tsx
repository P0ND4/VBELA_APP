import React from "react";
import { StatisticsRouteProp } from "domain/entities/navigation";
import KitchenScreen from "presentation/screens/common/kitchens/KitchenScreen";

type ProductionProps = {
  route: StatisticsRouteProp<"Production">;
};

const Production: React.FC<ProductionProps> = ({ route }) => {
  const orders = route.params.orders;

  return <KitchenScreen orders={orders} />;
};

export default Production;
