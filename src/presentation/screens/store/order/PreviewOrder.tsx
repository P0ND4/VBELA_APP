import React, { useEffect } from "react";
import { useAppDispatch } from "application/store/hook";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { add } from "application/slice/stores/products.slice";
import { StackNavigationProp } from "@react-navigation/stack";
import SalesPreviewScreen from "presentation/screens/common/sales/trade/SalesPreviewScreen";

type PreviewOrderProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"PreviewOrder">;
};

const PreviewOrder: React.FC<PreviewOrderProps> = ({ navigation, route }) => {
  const storeID = route.params.storeID;
  const defaultValue = route.params?.defaultValue;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: "Previsualizar orden" });
  }, []);

  return (
    <SalesPreviewScreen
      defaultValue={defaultValue}
      sendButton={() => navigation.navigate("OrderPayment", { storeID })}
      goBack={() => navigation.pop()}
      addElement={(data) => dispatch(add(data))}
      locationID={storeID}
      buttonsEvent={{ 
        // delivery: () => alert("Para la segunda actualización") 
      }}
    />
  );
};

export default PreviewOrder;
