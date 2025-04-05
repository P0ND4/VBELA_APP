import { useEffect, useState } from "react";
import { useAppSelector } from "application/store/hook";
import { random, thousandsSystem } from "shared/utils";
import { PaymentMethod } from "domain/entities/data/common/order.entity";
import CountScreenModal from "presentation/components/modal/CountScreenModal";

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
    <CountScreenModal
      title="Monto a pagar"
      increasers={false}
      decimal={true}
      description={() => "Editar monto a pagar"}
      padDescription={(value) => (value !== total ? `Monto: ${thousandsSystem(total)}` : "")}
      visible={visible}
      defaultValue={value}
      maxValue={9999999999}
      condition={(value) => Number(value) >= 0.01}
      onClose={onClose}
      onSave={(value) => {
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
  );
};

export default PaymentScreen;
