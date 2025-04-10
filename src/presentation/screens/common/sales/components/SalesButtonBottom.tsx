import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { formatDecimals, thousandsSystem } from "shared/utils";
import { useOrder } from "application/context/OrderContext";
import { Order, Save } from "domain/entities/data/common";
import { Status } from "domain/enums/data/element/status.enums";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import FloorModal from "presentation/components/modal/FloorModal";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import DiscountScreen from "./DiscountScreen";

type ButtonsEvent = {
  delivery?: () => void;
  kitchen?: (props: Save, order: Order | null) => void;
  clean?: () => void;
};

const useModal = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const toggleModal = () => setModalVisible(!modalVisible);
  return { modalVisible, toggleModal };
};

type OptionProps = {
  name: string;
  onPress: () => void;
  color?: string;
  isNavigation?: boolean;
};

const Option: React.FC<OptionProps> = ({ name, onPress, color, isNavigation }) => {
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity style={[styles.option, styles.row]} onPress={onPress}>
        <StyledText color={color || colors.text}>{name}</StyledText>
        {isNavigation && <Ionicons name="chevron-forward" color={colors.text} size={19} />}
      </TouchableOpacity>
      <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
    </>
  );
};

type OptionsModalProps = {
  locationID: string;
  tableID?: string;
  visible: boolean;
  onClose: () => void;
  onPress: () => void;
  name?: string;
  buttonsEvent?: ButtonsEvent;
};

const OptionsModal: React.FC<OptionsModalProps> = ({
  locationID,
  tableID,
  visible,
  onClose,
  onPress,
  name,
  buttonsEvent,
}) => {
  const { colors } = useTheme();
  const { info, updateInfo, selection, clean, order } = useOrder();

  const [observationModal, setObservationModal] = useState<boolean>(false);
  const [discountModal, setDiscountModal] = useState<boolean>(false);

  return (
    <>
      <FloorModal
        title="Más opciones del pedido"
        animationType="fade"
        visible={visible}
        onClose={onClose}
      >
        <View style={{ marginVertical: 15 }}>
          {buttonsEvent?.delivery && (
            <Option name="Enviar a delivery" onPress={buttonsEvent.delivery} isNavigation />
          )}
          {buttonsEvent?.kitchen && (
            <Option
              name="Enviar a cocina"
              onPress={() => {
                if (!selection.length)
                  return Alert.alert("OOPS!", "No hay elementos seleccionados");

                const modificationDate = new Date().getTime();
                const orderData: Pick<Save, "selection" | "status"> = {
                  selection,
                  status: Status.Standby,
                };

                const data = order ? { ...order, ...orderData, modificationDate } : null;

                buttonsEvent.kitchen!(
                  {
                    ...orderData,
                    paymentMethods: [],
                    locationID,
                    tableID,
                    info,
                  },
                  data,
                );
              }}
            />
          )}
          <Option
            name={
              info.observation
                ? `Observación agregada (${thousandsSystem(info.observation.length)})`
                : "Añadir observación"
            }
            onPress={() => {
              if (!selection.length) return Alert.alert("OOPS!", "No hay elementos seleccionados");
              setObservationModal(true);
            }}
            isNavigation
          />
          <Option
            name={
              info.discount
                ? `Descuento aplicado de un (${formatDecimals(info.discount * 100, 2)}%)`
                : "Añadir descuento"
            }
            onPress={() => {
              if (!selection.length) return Alert.alert("OOPS!", "No hay elementos seleccionados");
              setDiscountModal(true);
            }}
            isNavigation
          />

          <Option
            name="Vaciar carrito"
            onPress={() => {
              buttonsEvent?.clean && buttonsEvent.clean();
              clean();
              onClose();
            }}
            color={colors.primary}
          />
        </View>
        <ButtonBottom name={name} onPress={onPress} toggleModal={onClose} />
      </FloorModal>
      <InputScreenModal
        defaultValue={info.observation}
        title="Observación"
        placeholder="¿Qué observaciones quiere hacer al pedido?"
        visible={observationModal}
        maxLength={1000}
        onClose={() => setObservationModal(false)}
        onSubmit={(observation) => updateInfo({ observation })}
      />
      <DiscountScreen
        visible={discountModal}
        defaultDiscount={info.discount}
        maxValue={selection.reduce((a, b) => a + b.quantity * b.value, 0)}
        onClose={() => setDiscountModal(false)}
        onSave={(discount) => updateInfo({ discount })}
      />
    </>
  );
};

type ButtonBottomProps = {
  onPress: () => void;
  name?: string;
  toggleModal: () => void;
  buttonsEvent?: ButtonsEvent;
};

const ButtonBottom: React.FC<ButtonBottomProps> = ({ onPress, name, toggleModal }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <StyledButton auto onPress={toggleModal} style={{ marginRight: 5 }}>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
      </StyledButton>
      <StyledButton backgroundColor={colors.primary} auto style={{ flexGrow: 1 }} onPress={onPress}>
        <StyledText color="#FFFFFF" center>
          {name}
        </StyledText>
      </StyledButton>
    </View>
  );
};

type SalesButtonBottomProps = {
  locationID: string;
  tableID?: string;
  onPress?: () => void;
  name?: string;
  buttonsEvent?: ButtonsEvent;
};

const SalesButtonBottom: React.FC<SalesButtonBottomProps> = ({
  locationID,
  tableID,
  onPress = () => {},
  name,
  buttonsEvent,
}) => {
  const { modalVisible, toggleModal } = useModal();

  return (
    <>
      <ButtonBottom onPress={onPress} name={name} toggleModal={toggleModal} />
      <OptionsModal
        locationID={locationID}
        tableID={tableID}
        visible={modalVisible}
        onClose={toggleModal}
        onPress={onPress}
        name={name}
        buttonsEvent={buttonsEvent}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  option: { paddingVertical: 14 },
});

export default SalesButtonBottom;
