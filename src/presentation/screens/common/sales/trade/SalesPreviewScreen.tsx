import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Switch, TextInput } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useOrder } from "application/context/OrderContext";
import { formatDecimals, thousandsSystem } from "shared/utils";
import { Element, Order, Save, Selection } from "domain/entities/data/common";
import { send } from "../utils/transform.element";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import SalesButtonBottom from "../components/SalesButtonBottom";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import PercentageScreen from "../components/PercentageScreen";
import ScreenModal from "presentation/components/modal/ScreenModal";
import { useAppSelector } from "application/store/hook";

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
              title={!item.value ? "GRATIS" : thousandsSystem(item.value)}
              paragraph={item.unit}
              icon="cash-outline"
              onPress={() => setValueModal(true)}
            />
            {item?.registered && !!item.value && (
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
      <CountScreenModal
        title="Cantidad"
        description={(count) =>
          count ? `Vender ${thousandsSystem(count)} unidad del próximo item` : "Adicione un valor"
        }
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
      <PercentageScreen
        title="Descuento"
        numericComponent={() => (
          <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
            El descuento de este menú o producto será cambiado a porcentaje una vez guardado
          </StyledText>
        )}
        padDescription={() => `Valor máximo: ${thousandsSystem(item.quantity * item.value)}`}
        visible={discountModal}
        maxValue={item.quantity * item.value}
        defaultValue={item.discount}
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
            if (register) addElement(send({ name, value: item.value, locationID }));
            updateSelection({ ...item, name, registered: register });
          }}
        />
      )}
      <CountScreenModal
        title="Precio unitario"
        visible={valueModal}
        increasers={false}
        decimal={true}
        condition={(count) => Number(count) >= 0}
        numericComponent={() => (
          <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
            El precio unitario de este menú o pedido será cambiado por solo esta venta.
          </StyledText>
        )}
        onClose={() => setValueModal(false)}
        defaultValue={item.value}
        maxValue={9999999999}
        onSave={(value) => {
          updateSelection({
            ...item,
            value,
            total: item.quantity * value,
            discount: !!value ? item.discount : 0,
          });
          setValueModal(false);
        }}
      />
    </>
  );
};

type SalesPreviewScreenProps = {
  defaultValue?: Order | null;
  sendButton: () => void;
  goBack: () => void;
  addElement: (data: Element) => void;
  locationID: string;
  tableID?: string;
  buttonsEvent: {
    delivery?: () => void;
    kitchen?: (props: Save, order: Order | null) => void;
  };
};

const SalesPreviewScreen: React.FC<SalesPreviewScreenProps> = ({
  defaultValue,
  sendButton = () => {},
  goBack = () => {},
  addElement = () => {},
  buttonsEvent,
  locationID,
  tableID,
}) => {
  const { colors } = useTheme();
  const { info, updateInfo, selection, change } = useOrder();

  const tip = useAppSelector((state) => state.tip);
  const tax = useAppSelector((state) => state.tax);

  const [discountModal, setDiscountModal] = useState<boolean>(false);
  const [taxModal, setTaxModal] = useState<boolean>(false);
  const [tipModal, setTipModal] = useState<boolean>(false);

  const value = useMemo(() => selection.reduce((a, b) => a + b.total, 0), [selection]);
  const totalWithoutTaxTip = useMemo(() => value - value * info.discount, [value, info.discount]);
  const total = useMemo(
    () => totalWithoutTaxTip + info.tip + totalWithoutTaxTip * info.tax,
    [totalWithoutTaxTip, info.discount, info.tax, info.tip],
  );
  const quantity = useMemo(() => selection.reduce((a, b) => a + b.quantity, 0), [selection]);

  useEffect(() => {
    if (defaultValue) return change(defaultValue);

    const newDiscount = !value ? 0 : info.discount;
    const newTip = !totalWithoutTaxTip ? info.tip : totalWithoutTaxTip * tip;
    const newTax = !totalWithoutTaxTip ? 0 : info.tax;

    updateInfo({
      discount: newDiscount,
      tip: newTip,
      tax: newTax,
    });
  }, [value, totalWithoutTaxTip, tip, tax, defaultValue]);

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
            {!!value && (
              <TouchableOpacity onPress={() => setDiscountModal(true)}>
                <StyledText right color={colors.primary}>
                  {info.discount ? `(${formatDecimals(info.discount * 100, 2)}%)` : ""} Dar
                  descuento
                </StyledText>
              </TouchableOpacity>
            )}
            {!!totalWithoutTaxTip && (
              <TouchableOpacity onPress={() => setTaxModal(true)}>
                <StyledText right color={colors.primary}>
                  {info.tax ? `(${formatDecimals(info.tax * 100, 2)}%)` : ""} Impuesto
                </StyledText>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setTipModal(true)}>
              <StyledText right color={colors.primary}>
                {info.tip ? `(${thousandsSystem(info.tip)})` : ""} Propina
              </StyledText>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => alert("Para la segunda actualización")}>
              <StyledText right color={colors.primary}>
                Destino de entrega
              </StyledText>
            </TouchableOpacity> */}

            <StyledText right>
              Total: <StyledText>{!total ? "GRATIS" : thousandsSystem(total)}</StyledText>
            </StyledText>
          </View>
        </View>
        <SalesButtonBottom
          locationID={locationID}
          tableID={tableID}
          name={`${thousandsSystem(quantity)} pedidos = ${!total ? "GRATIS" : thousandsSystem(total)}`}
          onPress={() => sendButton()}
          buttonsEvent={{
            ...buttonsEvent,
            clean: () => goBack(),
          }}
        />
      </Layout>
      <CountScreenModal
        title="Propina"
        description={() => `Defina la propina de la venta`}
        isRemove={!!info.tip}
        increasers={false}
        maxValue={9999999999}
        visible={tipModal}
        defaultValue={info.tip || 0}
        onClose={() => setTipModal(false)}
        onSave={(tip) => updateInfo({ tip })}
      />
      <PercentageScreen
        title="Impuesto"
        numericComponent={() => (
          <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
            El impuesto de este menú o producto será cambiado a porcentaje una vez guardado
          </StyledText>
        )}
        padDescription={() => `Valor máximo: ${thousandsSystem(totalWithoutTaxTip)}`}
        visible={taxModal}
        onClose={() => setTaxModal(false)}
        defaultValue={info.tax || 0}
        maxValue={totalWithoutTaxTip}
        onSave={(tax) => updateInfo({ tax })}
      />
      <PercentageScreen
        title="Descuento"
        numericComponent={() => (
          <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
            El descuento de este menú o producto será cambiado a porcentaje una vez guardado
          </StyledText>
        )}
        padDescription={() => `Valor máximo: ${thousandsSystem(value)}`}
        visible={discountModal}
        onClose={() => setDiscountModal(false)}
        defaultValue={info.discount || 0}
        maxValue={value}
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
