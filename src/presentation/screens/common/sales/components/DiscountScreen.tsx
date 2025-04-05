import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import StyledText from "presentation/components/text/StyledText";
import CountScreenModal from "presentation/components/modal/CountScreenModal";

type DiscountScreenProps = {
  visible: boolean;
  onClose: () => void;
  defaultDiscount: number;
  maxLength: number;
  onSave: (discount: number) => void;
};

const DiscountScreen: React.FC<DiscountScreenProps> = ({
  visible,
  onClose,
  defaultDiscount,
  maxLength,
  onSave,
}) => {
  const { colors } = useTheme();

  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    visible && setDiscount(maxLength * defaultDiscount);
  }, [visible]);

  return (
    <>
      <CountScreenModal
        title="Descuento"
        increasers={false}
        headerRight={() => (
          <TouchableOpacity
            style={{ paddingRight: 25 }}
            onPress={() => {
              onSave(0);
              onClose();
            }}
          >
            <StyledText color={colors.primary}>Limpiar</StyledText>
          </TouchableOpacity>
        )}
        numericComponent={() => (
          <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
            El descuento de este menú o producto será cambiado a porcentaje una vez guardado
          </StyledText>
        )}
        padDescription={() => `Valor máximo: ${thousandsSystem(maxLength)}`}
        visible={visible}
        onClose={onClose}
        defaultValue={discount}
        maxValue={maxLength}
        onSave={(discount) => {
          onSave(discount / maxLength);
          onClose();
        }}
      />
    </>
  );
};

export default DiscountScreen;
