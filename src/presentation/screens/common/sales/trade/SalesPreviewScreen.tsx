import React, { useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Switch, TextInput } from "react-native";
import { Numeric, Pad } from "../../NumericPad";
import { useTheme } from "@react-navigation/native";
import { useOrder } from "application/context/sales/OrderContext";
import { Selection } from "domain/entities/data/common/order.entity";
import { formatDecimals, random, thousandsSystem } from "shared/utils";
import { Element } from "domain/entities/data/common/element.entity";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import SalesButtonBottom from "../components/SalesButtonBottom";
import CountScreen from "../components/CountScreen";
import DiscountScreen from "../components/DiscountScreen";
import ScreenModal from "presentation/components/modal/ScreenModal";

type ValueModalProps = {
  visible: boolean;
  onClose: () => void;
  defaultValue: number;
  onSave: (value: number) => void;
};

const ValueModal: React.FC<ValueModalProps> = ({ visible, onClose, onSave, defaultValue }) => {
  const [value, setValue] = useState<number>(defaultValue);

  return (
    <ScreenModal title="Precio unitario" visible={visible} onClose={onClose}>
      <View style={{ flex: 1 }}>
        <View style={[styles.center, { flex: 2 }]}>
          <Numeric
            title="Editar precio unitario"
            inputStyle={{ minWidth: 240 }}
            value={thousandsSystem(value)}
            description={() => (
              <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
                El precio unitario de este menú o pedido será cambiado por solo esta venta.
              </StyledText>
            )}
          />
        </View>
        <View style={{ flex: 4 }}>
          <Pad
            value={value}
            onChange={(value: number) => setValue(value)}
            buttonText="Guardar"
            maxValue={9999999999}
            condition={value > 0}
            onSave={() => {
              onSave(value);
              onClose();
            }}
          />
        </View>
      </View>
    </ScreenModal>
  );
};

type DescriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  defaultValue: string;
  onSave: (name: string, register: boolean) => void;
};

const DescriptionModal: React.FC<DescriptionModalProps> = ({
  visible,
  onClose,
  defaultValue,
  onSave,
}) => {
  const { colors } = useTheme();

  const [name, setName] = useState<string>(defaultValue);
  const [register, setRegister] = useState<boolean>(false);

  return (
    <ScreenModal title="Descripción" visible={visible} onClose={onClose}>
      <Layout>
        <View style={[{ flexGrow: 1 }, styles.center]}>
          <View>
            <StyledText center>Nombre</StyledText>
            <TextInput
              value={name}
              style={[styles.inputDescription, { borderColor: colors.primary, color: colors.text }]}
              placeholderTextColor={colors.border}
              placeholder="Digite la Descripción"
              maxLength={30}
              onChangeText={setName}
            />
          </View>
        </View>
        <View>
          <View style={[styles.row, styles.descriptionToggle, { borderColor: colors.border }]}>
            <StyledText>Registrar producto producto</StyledText>
            <Switch
              value={register}
              onValueChange={setRegister}
              thumbColor={register ? colors.primary : colors.card}
            />
          </View>
          <StyledButton
            backgroundColor={colors.primary}
            style={{ marginTop: 10 }}
            disable={!name}
            onPress={() => {
              onSave(name, register);
              onClose();
            }}
          >
            <StyledText center color="#FFFFFF">
              Guardar
            </StyledText>
          </StyledButton>
        </View>
      </Layout>
    </ScreenModal>
  );
};

type OptionButtonProps = {
  title: string;
  paragraph?: string;
  color?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const OptionButton: React.FC<OptionButtonProps> = ({
  title,
  paragraph,
  color,
  icon,
  onPress = () => {},
}) => {
  const { colors } = useTheme();

  return (
    <StyledButton onPress={onPress} style={[styles.buttonAction, { borderColor: colors.border }]}>
      <Ionicons name={icon} size={30} color={color || colors.text} />
      <StyledText smallParagraph center color={color || colors.text}>
        {title}
      </StyledText>
      {paragraph && (
        <StyledText smallParagraph center color={colors.primary}>
          {paragraph}
        </StyledText>
      )}
    </StyledButton>
  );
};

type CardProps = {
  item: Selection;
  addElement: (data: Element) => void;
  locationID: string;
  goBack: () => void;
};

const Card: React.FC<CardProps> = ({ item, addElement, locationID, goBack = () => {} }) => {
  const { colors } = useTheme();
  const { updateSelection, removeSelection, selection } = useOrder();

  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [countModal, setCountModal] = useState<boolean>(false);
  const [discountModal, setDiscountModal] = useState<boolean>(false);
  const [valueModal, setValueModal] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <StyledButton onPress={() => setOpen(!open)} style={{ borderRadius: 0, marginVertical: 0 }}>
        <View style={styles.row}>
          <StyledText>
            {thousandsSystem(item.quantity)}
            <StyledText color={colors.primary}>x</StyledText> {item.name}
          </StyledText>
          <StyledText color={colors.primary}>
            {!item.total ? "GRATIS" : thousandsSystem(item.total)}
          </StyledText>
        </View>
      </StyledButton>
      {open && (
        <>
          <View style={{ flexDirection: "row" }}>
            <OptionButton
              title={`${thousandsSystem(item.quantity)} Item`}
              icon="cube-outline"
              onPress={() => setCountModal(true)}
            />
            <OptionButton
              title={thousandsSystem(item.value)}
              paragraph={item.unit}
              icon="cash-outline"
              onPress={() => setValueModal(true)}
            />
            {item?.registered && (
              <OptionButton
                title="Descuento"
                paragraph={item.discount ? `${formatDecimals(item.discount * 100, 2)}%` : undefined}
                color={colors.primary}
                icon="pricetags-outline"
                onPress={() => setDiscountModal(true)}
              />
            )}
          </View>
          {!item?.registered && (
            <View style={{ flexDirection: "row" }}>
              <OptionButton
                title="Descripción"
                icon="document-outline"
                onPress={() => setDescriptionModal(true)}
              />
              <OptionButton
                title="Descuento"
                paragraph={item.discount ? `${formatDecimals(item.discount * 100, 2)}%` : undefined}
                color={colors.primary}
                icon="pricetags-outline"
                onPress={() => setDiscountModal(true)}
              />
            </View>
          )}
        </>
      )}
      <CountScreen
        visible={countModal}
        defaultValue={item.quantity}
        isRemove
        onClose={() => setCountModal(false)}
        onSave={(quantity) => {
          if (quantity === 0) {
            !selection.filter((s) => s.id !== item.id).length && goBack();
            removeSelection(item.id);
          } else updateSelection({ ...item, quantity, total: quantity * item.value });
        }}
      />
      <DiscountScreen
        visible={discountModal}
        maxLength={item.quantity * item.value}
        defaultDiscount={item.discount}
        onClose={() => setDiscountModal(false)}
        onSave={(discount) => {
          const total = item.quantity * item.value;
          updateSelection({ ...item, discount, total: total - total * discount });
        }}
      />
      {!item.registered && (
        <DescriptionModal
          visible={descriptionModal}
          onClose={() => setDescriptionModal(false)}
          defaultValue={item.name}
          onSave={(name, register) => {
            if (register) {
              const data = {
                id: random(10),
                name,
                price: item.value,
                locationID,
                creationDate: new Date().toISOString(),
                modificationDate: new Date().toISOString(),
              };
              addElement(data);
            }
            updateSelection({ ...item, name, registered: register });
          }}
        />
      )}
      <ValueModal
        visible={valueModal}
        onClose={() => setValueModal(false)}
        defaultValue={item.value}
        onSave={(value) => updateSelection({ ...item, value, total: item.quantity * value })}
      />
    </>
  );
};

type SalesPreviewScreenProps = {
  sendButton: () => void;
  goBack: () => void;
  addElement: (data: Element) => void;
  locationID: string;
  buttonsEvent: {
    delivery?: () => void;
    kitchen?: () => void;
  };
};

const SalesPreviewScreen: React.FC<SalesPreviewScreenProps> = ({
  sendButton = () => {},
  goBack = () => {},
  addElement = () => {},
  buttonsEvent,
  locationID,
}) => {
  const { colors } = useTheme();
  const { info, updateInfo, selection } = useOrder();

  const [discountModal, setDiscountModal] = useState<boolean>(false);

  const value = selection.reduce((a, b) => a + b.total, 0);
  const total = value - value * info.discount;
  const quantity = selection.reduce((a, b) => a + b.quantity, 0);

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View>
          <FlatList
            data={selection}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card item={item} addElement={addElement} locationID={locationID} goBack={goBack} />
            )}
          />
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity onPress={() => setDiscountModal(true)}>
              <StyledText right color={colors.primary}>
                {info.discount ? `(${formatDecimals(info.discount * 100, 2)}%)` : ""} Dar descuento
              </StyledText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert("Para la segunda actualización")}>
              <StyledText right color={colors.primary}>
                Destino de entrega
              </StyledText>
            </TouchableOpacity>

            <StyledText right>
              Total: <StyledText>{!total ? "GRATIS" : thousandsSystem(total)}</StyledText>
            </StyledText>
          </View>
        </View>
        <SalesButtonBottom
          name={`${thousandsSystem(quantity)} pedidos = ${thousandsSystem(total)}`}
          onPress={() => sendButton()}
          buttonsEvent={{
            ...buttonsEvent,
            clean: () => goBack(),
          }}
        />
      </Layout>
      <DiscountScreen
        visible={discountModal}
        maxLength={total}
        defaultDiscount={info.discount || 0}
        onClose={() => setDiscountModal(false)}
        onSave={(discount) => updateInfo({ discount })}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonAction: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    flexBasis: 0,
    marginVertical: 0,
    elevation: 0,
    borderWidth: 0.8,
    borderRadius: 0,
    width: "auto",
  },
  descriptionToggle: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  inputDescription: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    borderBottomWidth: 2,
    textAlign: "center",
    width: 300,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SalesPreviewScreen;
