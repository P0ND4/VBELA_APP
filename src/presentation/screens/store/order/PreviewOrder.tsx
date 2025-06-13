import React, { useEffect } from "react";
import { useAppDispatch } from "application/store/hook";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { add } from "application/slice/stores/products.slice";
import { StackNavigationProp } from "@react-navigation/stack";
import { Element } from "domain/entities/data/common/element.entity";
import apiClient from "infrastructure/api/server";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import SalesPreviewScreen from "presentation/screens/common/sales/trade/SalesPreviewScreen";
import StyledText from "presentation/components/text/StyledText";
import { useOrganizeData } from "presentation/screens/common/sales/hooks";
import { useOrder } from "application/context/OrderContext";
import { Status } from "domain/enums/data/element/status.enums";
import { useInvoiceHtml } from "presentation/screens/common/sales/hooks/useInvoiceHtml";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { printPDF } from "infrastructure/services";
import endpoints from "config/constants/api.endpoints";
// import { useInvoiceHtml } from "presentation/screens/common/sales/hooks/useInvoiceHtml";

type PreviewOrderProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"PreviewOrder">;
};

const PreviewOrder: React.FC<PreviewOrderProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();
  const { organizeOrder } = useOrganizeData();
  const { info, selection } = useOrder();
  const { getHtml } = useInvoiceHtml();

  const storeID = route.params.storeID;
  const defaultValue = route.params?.defaultValue;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({
      title: "Previsualizar",
      headerRight: () => (
        <TouchableOpacity
          style={[styles.print, { borderColor: colors.border }]}
          onPress={() => {
            const order = organizeOrder({
              selection,
              status: Status.Pending,
              paymentMethods: [],
              locationID: storeID,
              info,
            });

            printPDF({ html: getHtml(order) });
          }}
        >
          <StyledText verySmall style={{ marginLeft: 2 }}>
            imprimir
          </StyledText>
        </TouchableOpacity>
      ),
    });
  }, [selection, storeID, info]);

  const addElement = async (data: Element) => {
    dispatch(add(data));
    await apiClient({
      url: endpoints.product.post(),
      method: "POST",
      data,
    });
    emit("accessToStore");
  };

  return (
    <SalesPreviewScreen
      defaultValue={defaultValue}
      sendButton={() => navigation.navigate("OrderPayment", { storeID })}
      goBack={() => navigation.pop()}
      addElement={addElement}
      locationID={storeID}
      buttonsEvent={
        {
          // delivery: () => alert("Para la segunda actualización")
        }
      }
    />
  );
};

const styles = StyleSheet.create({
  print: {
    marginRight: 20,
    borderWidth: 1,
    marginHorizontal: 2,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default PreviewOrder;
