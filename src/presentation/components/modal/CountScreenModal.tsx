import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Pad } from "presentation/screens/common/NumericPad";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

type CountScreenProps = {
  title: string;
  description?: (count: number) => string;
  visible: boolean;
  isRemove?: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  defaultValue?: number;
  negativeNumber?: boolean;
  maxValue?: number;
};

const CountScreenModal: React.FC<CountScreenProps> = ({
  title,
  description,
  visible,
  onClose,
  defaultValue = 1,
  isRemove,
  onSave,
  negativeNumber,
  maxValue = 999,
}) => {
  const { colors } = useTheme();

  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    visible && setCount(Math.abs(defaultValue));
  }, [visible]);

  return (
    <ScreenModal title={title} visible={visible} onClose={onClose}>
      <View style={{ flex: 1 }}>
        <View style={[styles.center, { flex: 2 }]}>
          {description && <StyledText>{description(count)}</StyledText>}
          <View style={styles.valueContainer}>
            <TouchableOpacity
              style={{ flexShrink: 0 }}
              onPress={() => count >= 1 && setCount(count - 1)}
            >
              <Ionicons name="remove" size={40} color={colors.text} />
            </TouchableOpacity>
            <StyledText bigTitle center color={colors.primary} style={{ flexGrow: 1 }}>
              {thousandsSystem(count)}
            </StyledText>
            <TouchableOpacity
              style={{ flexShrink: 0 }}
              onPress={() => count < maxValue && setCount(count + 1)}
            >
              <Ionicons name="add" size={40} color={colors.text} />
            </TouchableOpacity>
          </View>
          {isRemove && (
            <TouchableOpacity
              style={{ marginTop: 15 }}
              onPress={() => {
                onSave(0);
                onClose();
              }}
            >
              <StyledText color={colors.primary} smallSubtitle style={{ marginTop: 15 }}>
                Eliminar
              </StyledText>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 4 }}>
          <Pad
            value={count}
            onChange={(count: number) => setCount(count)}
            buttonText="Guardar"
            maxValue={maxValue}
            condition={count >= 1}
            onSave={() => {
              onSave(count * (negativeNumber ? -1 : 1));
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
  valueContainer: {
    paddingHorizontal: 30,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default CountScreenModal;
