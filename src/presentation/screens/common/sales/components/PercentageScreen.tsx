import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";
import CountScreenModal from "presentation/components/modal/CountScreenModal";

type PercentageScreenProps = {
  title: string;
  visible: boolean;
  padDescription?: (count: number | string) => string;
  numericComponent?: (count: number | string) => React.ReactNode;
  onClose: () => void;
  defaultValue: number;
  maxValue: number;
  onSave: (discount: number) => void;
};

const PercentageScreen: React.FC<PercentageScreenProps> = ({
  title,
  padDescription,
  numericComponent,
  visible,
  onClose,
  defaultValue,
  maxValue,
  onSave,
}) => {
  const { colors } = useTheme();

  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    visible && setDiscount(maxValue * defaultValue);
  }, [visible]);

  return (
    <>
      <CountScreenModal
        title={title}
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
        numericComponent={numericComponent}
        padDescription={padDescription}
        visible={visible}
        onClose={onClose}
        defaultValue={discount}
        maxValue={maxValue}
        onSave={(discount) => {
          onSave(discount / maxValue);
          onClose();
        }}
      />
    </>
  );
};

export default PercentageScreen;
