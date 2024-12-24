import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { thousandsSystem } from "shared/utils";
import { useStatusInfo } from "../hooks/useStatusInfo";
import { useTheme } from "@react-navigation/native";
import { Status } from "domain/enums/data/element/status.enums";
import { Order } from "domain/entities/data/common";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import SwipeButton from "presentation/components/button/SwipeButton";
import OrderInformation from "./OrderInformation";
import OrderDetails from "./OrderDetails";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import FloorModal from "presentation/components/modal/FloorModal";
import PaymentScreen from "presentation/screens/common/sales/components/PaymentScreen";
import PaymentButtons from "presentation/components/button/PaymentButtons";
import OrderPayment from "./OrderPayment";

const Tab = createMaterialTopTabNavigator();

type PaymentMethodsModalProps = {
  visible: boolean;
  onClose: () => void;
  onPress: (id: string) => void;
};

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ visible, onClose, onPress }) => {
  return (
    <FloorModal title="Selecciona el método de pago" visible={visible} onClose={onClose}>
      <PaymentButtons
        onPress={(id) => {
          onPress(id);
          onClose();
        }}
        showPaymentButtonEditing={false}
        containerStyle={{ marginTop: 15 }}
      />
    </FloorModal>
  );
};

type Icons = keyof typeof Ionicons.glyphMap;

type OptionProps = {
  name: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
  icon: Icons;
};

const Option: React.FC<OptionProps> = ({ name, onPress, iconColor, textColor, icon }) => {
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity style={styles.option} onPress={onPress}>
        <Ionicons
          name={icon}
          color={iconColor || colors.text}
          size={24}
          style={{ marginRight: 15 }}
        />
        <StyledText color={textColor || colors.text}>{name}</StyledText>
      </TouchableOpacity>
      <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
    </>
  );
};

type OptionsModal = {
  visible: boolean;
  onClose: () => void;
  onEditOrder: () => void;
  onChange: (updatedData: Partial<Order>) => void;
};

const OptionsModal: React.FC<OptionsModal> = ({ visible, onClose, onEditOrder, onChange }) => {
  const { colors } = useTheme();

  return (
    <FloorModal
      title="MÁS OPCIONES DEL PEDIDO"
      animationType="fade"
      visible={visible}
      onClose={onClose}
    >
      <View style={{ marginVertical: 15 }}>
        {/* <Option name="Compartir" onPress={() => {}} icon="share-social-outline" /> */}
        <Option
          name="Editar pedido"
          onPress={() => {
            onClose();
            onEditOrder();
          }}
          icon="create-outline"
        />
        <Option
          name="Cancelar pedido"
          onPress={() => onChange({ status: Status.Canceled })}
          icon="trash-outline"
          iconColor={colors.primary}
          textColor={colors.primary}
        />
      </View>
    </FloorModal>
  );
};

const StatusOption: React.FC<{ item: Status; onChange: () => void }> = ({ item, onChange }) => {
  const status = useStatusInfo(item);

  return <Option name={item} onPress={onChange} icon={status.icon} iconColor={status.color} />;
};

type ViewOrderProps = {
  onEditOrder: () => void;
  order?: Order;
  onChange: (updatedData: Partial<Order>) => void;
};

const ViewOrder: React.FC<ViewOrderProps> = ({ onEditOrder, order, onChange }) => {
  const { colors } = useTheme();

  if (!order)
    return (
      <Layout>
        <StyledText color={colors.primary}>PRODUCTO NO ENCONTRADO</StyledText>
      </Layout>
    );

  const coin = useAppSelector((state) => state.coin);

  const [observationModal, setObservationModal] = useState<boolean>(false);
  const [optionsModal, setOptionsModal] = useState<boolean>(false);
  const [statusModal, setStatusModal] = useState<boolean>(false);
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);
  const [paymentMethodsVisible, setPaymentMethodsVisible] = useState<boolean>(false);

  const [method, setMethod] = useState<string>("");

  const status = [Status.Pending, Status.Standby, Status.Confirmed];

  const value = useMemo(
    () => order?.selection?.reduce((a, b) => a + b.total, 0),
    [order?.selection],
  );
  const paid = useMemo(
    () => order?.paymentMethods?.reduce((a, b) => a + b.amount, 0),
    [order?.paymentMethods],
  );

  const buttonText = !order.paymentMethods.length
    ? "Ir al Pago"
    : paid < order.total
      ? `Monto faltante: ${thousandsSystem(order.total - paid)}`
      : "Completar pago";

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <View style={styles.header}>
          <View style={styles.row}>
            <StyledText subtitle lineThrough={order.status === Status.Canceled}>
              {coin} {thousandsSystem(order.total)}{" "}
              {!!order.discount && (
                <StyledText
                  color={colors.primary}
                >{`(-${thousandsSystem(value * order.discount)})`}</StyledText>
              )}
            </StyledText>
            <View>
              <StyledText smallParagraph right>
                #{order.order}
              </StyledText>
              {/* <StyledText smallParagraph>POR NOMBRE</StyledText> */}
            </View>
          </View>
          {![Status.Canceled, Status.Completed].includes(order.status) ? (
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <StyledButton
                auto
                style={[styles.button, { paddingVertical: 10, paddingHorizontal: 12 }]}
                onPress={() => setStatusModal(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.text} />
                <StyledText style={{ marginHorizontal: 10 }} smallParagraph>
                  {order.status}
                </StyledText>
                <Ionicons
                  name={statusModal ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20}
                  color={colors.text}
                />
              </StyledButton>
            </View>
          ) : (
            <StyledText
              style={{ marginTop: 15 }}
              color={order.status === Status.Completed ? colors.primary : colors.text}
            >
              {order.status}
            </StyledText>
          )}
        </View>
        <StyledButton style={styles.button} onPress={() => setObservationModal(true)}>
          {!order?.observation && <Ionicons name="add" size={30} style={{ marginRight: 15 }} />}
          <StyledText>
            {order?.observation?.length > 120
              ? `${order.observation.slice(0, 120)}...`
              : order?.observation || "Añadir observación"}
          </StyledText>
        </StyledButton>
        <Tab.Navigator screenOptions={{ tabBarStyle: { backgroundColor: colors.background } }}>
          <Tab.Screen name="PEDIDOS">
            {(props) => <OrderInformation {...props} selection={order.selection} />}
          </Tab.Screen>
          {/* <Tab.Screen name="DETALLES" component={OrderDetails} /> */}
          {!!order.paymentMethods.length && (
            <Tab.Screen name="PAGOS">
              {(props) => (
                <OrderPayment
                  {...props}
                  paymentMethods={order.paymentMethods}
                  isRemove={order.status !== Status.Completed}
                  onRemove={(id) => {
                    const paymentMethods = order.paymentMethods.filter((o) => o.id !== id);
                    onChange({ paymentMethods });
                  }}
                />
              )}
            </Tab.Screen>
          )}
        </Tab.Navigator>
        {![Status.Canceled, Status.Completed].includes(order.status) ? (
          <View style={[styles.row, { padding: 20 }]}>
            <StyledButton auto onPress={() => setOptionsModal(true)} style={{ marginRight: 5 }}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
            </StyledButton>
            {order.status === Status.Confirmed && (
              <StyledButton
                backgroundColor={colors.primary}
                style={{ flexGrow: 1, width: "auto" }}
                onPress={() => {
                  if (paid < order.total) return setPaymentMethodsVisible(true);
                  const change = Math.max(paid - order.total, 0);
                  onChange({ status: Status.Completed, change, paid });
                }}
              >
                <StyledText center color="#FFFFFF">
                  {buttonText}
                </StyledText>
              </StyledButton>
            )}
            {[Status.Pending, Status.Standby].includes(order.status) && (
              <SwipeButton onSubmit={() => onChange({ status: Status.Confirmed })} />
            )}
          </View>
        ) : (
          <View
            style={[
              styles.canceled,
              { backgroundColor: order.status === Status.Completed ? colors.primary : colors.card },
            ]}
          >
            <StyledText center color={order.status === Status.Completed ? "#FFFFFF" : colors.text}>
              {order.status}
            </StyledText>
          </View>
        )}
      </Layout>
      <InputScreenModal
        defaultValue={order?.observation}
        title="Observación"
        placeholder="¿Qué observaciones quiere hacer al pedido?"
        visible={observationModal}
        maxLength={1000}
        onClose={() => setObservationModal(false)}
        onSubmit={(observation) => onChange({ observation })}
      />
      <FloorModal
        title="SELECCIÓN DE ESTADOS"
        animationType="fade"
        style={{ maxHeight: 400 }}
        visible={statusModal}
        onClose={() => setStatusModal(false)}
      >
        <FlatList
          data={status}
          style={{ marginVertical: 15 }}
          renderItem={({ item }) => (
            <StatusOption
              item={item}
              onChange={() => {
                onChange({ status: item });
                setStatusModal(false);
              }}
            />
          )}
        />
      </FloorModal>
      <OptionsModal
        visible={optionsModal}
        onClose={() => setOptionsModal(false)}
        onEditOrder={onEditOrder}
        onChange={onChange}
      />
      <PaymentMethodsModal
        visible={paymentMethodsVisible}
        onClose={() => setPaymentMethodsVisible(false)}
        onPress={(id) => {
          setMethod(id);
          setPaymentVisible(true);
        }}
      />
      <PaymentScreen
        method={method}
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        onSave={(paymentMethod) => {
          const prevMethods = order.paymentMethods;
          onChange({
            paymentMethods: prevMethods.some((p) => p.id === paymentMethod.id)
              ? prevMethods.map((p) =>
                  p.id === paymentMethod.id ? { ...p, amount: p.amount + paymentMethod.amount } : p,
                )
              : [...prevMethods, paymentMethod],
          });
        }}
        total={order.total - paid}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 0,
  },
  option: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  canceled: { padding: 20 },
});

export default ViewOrder;
