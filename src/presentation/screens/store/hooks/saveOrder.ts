import { useAppDispatch } from "application/store/hook";
import { PaymentMethod, Selection } from "domain/entities/data/common/order.entity";
import { useNavigation } from "@react-navigation/native";
import { add } from "application/slice/stores/sales.slice";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStore } from "domain/entities/navigation";
import { useOrganizeData } from "presentation/screens/common/sales/hooks/useOrganizeData";

type NavigationProps = StackNavigationProp<RootStore>;

const useSave = () => {
  const organizeData = useOrganizeData();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProps>();

  const save = (selection: Selection[], paymentMethods: PaymentMethod[], status: string) => {
    const data = organizeData(selection, paymentMethods, status);

    dispatch(add(data));

    navigation.popToTop();
    navigation.navigate("StoreRoutes", { screen: "OrderCompleted", params: { sale: data } });
  };

  return { save };
};

export default useSave;
