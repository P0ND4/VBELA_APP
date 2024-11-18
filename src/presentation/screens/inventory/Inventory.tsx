import React from "react";
import { AppNavigationProp } from "domain/entities/navigation";
import MultipleScreen from "../common/MultipleScreen";

const Inventory: React.FC<AppNavigationProp> = () => {
  return <MultipleScreen name="Inventario" unregistered="NO HAY INVENTARIOS REGISTRADOS" />;
};

export default Inventory;
