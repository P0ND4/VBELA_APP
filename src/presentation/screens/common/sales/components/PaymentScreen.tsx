import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useOrder } from "application/context/sales/OrderContext";
import { Numeric, Pad } from "../../NumericPad";
import { random, thousandsSystem } from "shared/utils";
import { PaymentMethod, Selection } from "domain/entities/data/common/order.entity";
import ScreenModal from "presentation/components/modal/ScreenModal";

type PaymentScreenProps = {
  method: string;
  visible: boolean;
  onClose: () => void;
  onSave: (paymentMethods: PaymentMethod) => void;
  total: number;
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  visible,
  onClose,
  onSave,
  method,
  total,
}) => {
  const paymentMethods = useAppSelector((state) => state.paymentMethods);

  const [value, setValue] = useState<number>(total);

  useEffect(() => {
    visible && setValue(total);
  }, [visible]);

  return (
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
            description={value !== total ? `Monto: ${thousandsSystem(total)}` : undefined}
            value={value}
            onChange={(value: number) => setValue(value)}
            buttonText="Guardar"
            maxValue={9999999999}
            condition={value > 0}
            onSave={() => {
              onClose();
              const found = paymentMethods.find((p) => p.id === method);
              const paymentMethod: PaymentMethod = {
                id: found?.id || random(10),
                method: found?.name || "ELIMINADO",
                amount: value,
                icon: found?.icon || "image-outline",
              };
              onSave(paymentMethod);
            }}
          />
        </View>
      </View>
    </ScreenModal>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PaymentScreen;
