import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Pad } from "../../NumericPad";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

type CountScreenProps = {
  visible: boolean;
  isRemove?: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  defaultValue?: number;
};

const CountScreen: React.FC<CountScreenProps> = ({
  visible,
  onClose,
  defaultValue = 1,
  isRemove,
  onSave,
}) => {
  const { colors } = useTheme();

  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    visible && setCount(defaultValue);
  }, [visible]);

  return (
    <ScreenModal title="Cantidad" visible={visible} onClose={onClose}>
      <View style={{ flex: 1 }}>
        <View style={[styles.center, { flex: 2 }]}>
          <StyledText>
            {count
              ? `Vender ${thousandsSystem(count)} unidad del próximo item`
              : "Adicione un valor"}
          </StyledText>
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
              onPress={() => count < 999 && setCount(count + 1)}
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
            maxValue={999}
            condition={count > 0}
            onSave={() => {
              onSave(count);
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

export default CountScreen;
