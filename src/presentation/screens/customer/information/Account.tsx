import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { random, thousandsSystem } from "shared/utils";
import { Customer } from "domain/entities/data/customers";
import { Numeric, Pad } from "presentation/screens/common/NumericPad";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import FloorModal from "presentation/components/modal/FloorModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import PaymentButtons from "presentation/components/button/PaymentButtons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import { edit } from "application/slice/customers/customers.slice";

enum Type {
  Empty = "",
  Add = "add",
  Remove = "remove",
}

enum Status {
  NotSelected = "",
  Add = "add",
  Update = "update",
}

type onSaveProps = { value: number; observation: string };

type PaymentScreenProps = {
  visible: boolean;
  onClose: () => void;
  onSave: ({ value, observation }: onSaveProps) => void;
  isObservation: boolean;
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  visible,
  onClose,
  onSave,
  isObservation = true,
}) => {
  const [observationModal, setObservationModal] = useState<boolean>(false);
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    setValue(0);
  }, [visible]);

  return (
    <>
      <ScreenModal title="Monto a pagar" visible={visible} onClose={onClose}>
        <View style={{ flex: 1 }}>
          <View style={[styles.center, { flex: 2 }]}>
            <Numeric
              title="Editar monto a pagar"
              inputStyle={{ minWidth: 240 }}
              value={thousandsSystem(value)}
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
                if (!isObservation) {
                  onClose();
                  return onSave({ value, observation: "" });
                }
                setObservationModal(true);
              }}
            />
          </View>
        </View>
      </ScreenModal>
      {isObservation && (
        <InputScreenModal
          title="Observación"
          placeholder="Bonificación, regalo, Impuestos, etc..."
          disableHeaderRight
          visible={observationModal}
          onClose={() => setObservationModal(false)}
          onSubmit={(observation) => {
            onSave({ value, observation });
            onClose();
          }}
        />
      )}
    </>
  );
};

type BalanceUpdateModalProps = {
  visible: boolean;
  onClose: () => void;
  onPress: (type: Type) => void;
};

const BalanceUpdateModal: React.FC<BalanceUpdateModalProps> = ({ visible, onClose, onPress }) => {
  const { colors } = useTheme();

  return (
    <FloorModal title="Actualización de saldo" visible={visible} onClose={onClose}>
      <StyledText smallParagraph style={{ marginVertical: 10 }}>
        Este movimiento no afeactará sus informes.
      </StyledText>
      <StyledButton
        style={[styles.balanceUpdateButton, { borderColor: colors.border }]}
        backgroundColor="transparent"
        onPress={() => onPress(Type.Add)}
      >
        <Ionicons name="arrow-up" size={25} color={colors.primary} />
        <StyledText style={{ flexGrow: 1 }} center>
          Añadir crédito
        </StyledText>
      </StyledButton>
      <StyledButton
        style={[styles.balanceUpdateButton, { borderColor: colors.border }]}
        backgroundColor="transparent"
        onPress={() => onPress(Type.Remove)}
      >
        <Ionicons name="arrow-down" size={25} color="#F71010" />
        <StyledText style={{ flexGrow: 1 }} center>
          Substraer crédito
        </StyledText>
      </StyledButton>
    </FloorModal>
  );
};

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

type AccountProps = {
  customer: Customer;
};

const Account: React.FC<AccountProps> = ({ customer }) => {
  const { colors } = useTheme();

  const paymentMethods = useAppSelector((state) => state.paymentMethods);

  const [balanceUpdateModal, setBalanceUpdateModal] = useState<boolean>(false);

  const [paymentMethodsVisible, setPaymentMethodsVisible] = useState<boolean>(false);
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);

  const [status, setStatus] = useState<Status>(Status.NotSelected);
  const [type, setType] = useState<Type>(Type.Empty);
  const [method, setMethod] = useState<string>("");

  const dispatch = useAppDispatch();

  const onSave = ({ value, observation }: onSaveProps) => {
    const found = paymentMethods.find((m) => m.id === method);

    const data = {
      id: random(10),
      title: status === Status.Add ? "Adicionar" : "",
      amount: value,
      method: found?.name || "",
      previous: customer.total,
      status: "Finalizado",
      observation,
      creationDate: new Date().toISOString(),
    };

    const total = customer.total + (type === Type.Add ? value : -value);
    const account = [...customer.account, data];

    dispatch(edit({ ...customer, account, total }));
  };

  return (
    <>
      <Layout>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <StyledText smallParagraph>SALDO ACTUAL</StyledText>
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <StyledText center bigTitle>
              {thousandsSystem(customer.total)}
            </StyledText>
            <StyledButton
              backgroundColor={customer.total >= 0 ? colors.primary : "#F71010"}
              style={{ paddingVertical: 6, paddingHorizontal: 20, width: "auto" }}
              onPress={() => setPaymentMethodsVisible(true)}
            >
              <StyledText center color="#FFFFFF">
                {customer.total >= 0 ? "Adicionar crédito" : "Pagar débito"}
              </StyledText>
            </StyledButton>
          </View>
          <TouchableOpacity
            onPress={() => {
              setBalanceUpdateModal(true);
              setStatus(Status.Add);
            }}
          >
            <StyledText color={colors.primary}>Actualización de saldo</StyledText>
          </TouchableOpacity>
        </View>
        <StyledButton backgroundColor={colors.primary} style={styles.accountStatementButton}>
          <Ionicons name="document-outline" size={25} color="#FFFFFF" />
          <StyledText style={{ flexGrow: 1 }} center color="#FFFFFF">
            Extracto de la cuenta
          </StyledText>
        </StyledButton>
      </Layout>
      <BalanceUpdateModal
        visible={balanceUpdateModal}
        onClose={() => setBalanceUpdateModal(false)}
        onPress={(type) => {
          setBalanceUpdateModal(false);
          setPaymentVisible(true);
          setType(type);
          setStatus(Status.Update);
        }}
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
        isObservation={status !== Status.Add}
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        onSave={onSave}
      />
    </>
  );
};

const styles = StyleSheet.create({
  accountStatementButton: { flexDirection: "row", alignItems: "center" },
  balanceUpdateButton: {
    flexDirection: "row",
    alignItems: "center",
    elevation: 0,
    borderWidth: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Account;
