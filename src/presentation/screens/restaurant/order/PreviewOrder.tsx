import React, { useEffect } from "react";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { add } from "application/slice/restaurants/menu.slice";
import { Order, Element, Save } from "domain/entities/data/common";
import SalesPreviewScreen from "presentation/screens/common/sales/trade/SalesPreviewScreen";
import useSave, { CallbackProps } from "../hooks/useSave";
import apiClient, { endpoints } from "infrastructure/api/server";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useInvoiceHtml } from "presentation/screens/common/sales/hooks/useInvoiceHtml";
import StyledText from "presentation/components/text/StyledText";
import { useOrganizeData } from "presentation/screens/common/sales/hooks";
import { useOrder } from "application/context/OrderContext";
import { Status } from "domain/enums/data/element/status.enums";
import { printPDF } from "infrastructure/services";

type PreviewOrderProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"PreviewOrder">;
};

const PreviewOrder: React.FC<PreviewOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { kitchen } = useSave();
  const { organizeOrder } = useOrganizeData();
  const { info, selection, order } = useOrder();
  const { getHtml } = useInvoiceHtml();

  const navigationMethod = useAppSelector((state) => state.salesNavigationMethod);

  const defaultValue = route.params?.defaultValue;
  const restaurantID = route.params.restaurantID;
  const tableID = route.params.tableID;

  const dispatch = useAppDispatch();

  const next = ({ order }: CallbackProps) => {
    navigation.popToTop();
    (navigation[navigationMethod] as StackNavigationProp<RootRestaurant>["navigate"])(
      "RestaurantRoutes",
      { screen: "OrderCompleted", params: { sale: order } },
    );
  };

  const save = (status: Status) => ({
    selection,
    status,
    paymentMethods: [],
    locationID: restaurantID,
    tableID,
    info,
  });

  useEffect(() => {
    navigation.setOptions({
      title: "Previsualizar",
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={[styles.headerRightButton, { borderColor: colors.border }]}
            onPress={() => {
              const data = order
                ? {
                    ...order,
                    selection,
                    status: Status.Standby,
                    modificationDate: new Date().getTime(),
                  }
                : null;
              kitchen(save(Status.Standby), data, next);
            }}
          >
            <StyledText verySmall style={{ marginLeft: 2 }}>
              Enviar a cocina
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerRightButton, { borderColor: colors.border }]}
            onPress={() => printPDF({ html: getHtml(organizeOrder(save(Status.Pending))) })}
          >
            <StyledText verySmall style={{ marginLeft: 2 }}>
              imprimir
            </StyledText>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [selection, restaurantID, tableID, info]);

  const addElement = async (data: Element) => {
    dispatch(add(data));
    await apiClient({
      url: endpoints.menu.post(),
      method: "POST",
      data,
    });
  };

  return (
    <SalesPreviewScreen
      defaultValue={defaultValue}
      sendButton={() => navigation.navigate("OrderPayment", { restaurantID, tableID })}
      goBack={() => navigation.pop()}
      addElement={addElement}
      locationID={restaurantID}
      tableID={tableID}
      buttonsEvent={{
        kitchen: (props: Save, order: Order | null) => kitchen(props, order, next),
        // delivery: () => alert("Para la segunda actualización"),
      }}
    />
  );
};

const styles = StyleSheet.create({
  headerRightContainer: {
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerRightButton: {
    borderWidth: 1,
    marginHorizontal: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default PreviewOrder;
