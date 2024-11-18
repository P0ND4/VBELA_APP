import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Numeric, Pad } from "../../NumericPad";
import { thousandsSystem } from "shared/utils";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledText from "presentation/components/text/StyledText";

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
    <ScreenModal
      title="Descuento"
      visible={visible}
      onClose={onClose}
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
    >
      <View style={{ flex: 1 }}>
        <View style={[styles.center, { flex: 2 }]}>
          <Numeric
            title="Añade descuento"
            inputStyle={{ minWidth: 240 }}
            value={thousandsSystem(discount)}
            description={() => (
              <StyledText smallParagraph center style={{ marginTop: 30, paddingHorizontal: 30 }}>
                El descuento de este menú o producto será cambiado a porcentaje una vez guardado
              </StyledText>
            )}
          />
        </View>
        <View style={{ flex: 4 }}>
          <Pad
            description={`Valor máximo: ${thousandsSystem(maxLength)}`}
            value={discount}
            onChange={(discount: number) => setDiscount(discount)}
            buttonText="Guardar"
            maxValue={maxLength}
            condition={discount > 0}
            onSave={() => {
              onSave(discount / maxLength);
              onClose();
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

export default DiscountScreen;
