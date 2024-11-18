import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppSelector } from "application/store/hook";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { PaymentMethods } from "domain/entities/data/settings/payment.methods.entity";
import { RootApp } from "domain/entities/navigation";
import StyledText from "../text/StyledText";
import StyledButton from "./StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

type ButtonProps = {
  item: PaymentMethods;
  selected: boolean;
  onPress: () => void;
};

const Button: React.FC<ButtonProps> = React.memo(({ item, selected, onPress }) => {
  const { colors } = useTheme();

  return (
    <StyledButton
      style={[styles.button, { borderColor: selected ? "transparent" : colors.border }]}
      backgroundColor={selected ? colors.primary : colors.card}
      onPress={onPress}
    >
      <Ionicons name={item.icon} size={30} color={selected ? "#FFFFFF" : colors.text} />
      <StyledText color={selected ? "#FFFFFF" : colors.text}>{item.name}</StyledText>
    </StyledButton>
  );
});

type NavigationProps = StackNavigationProp<RootApp>;

type PaymentButtonsProps = {
  showPaymentButtonEditing?: boolean;
  selected?: string;
  onPress?: (id: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const PaymentButtons: React.FC<PaymentButtonsProps> = ({
  showPaymentButtonEditing = true,
  selected,
  onPress = () => {},
  containerStyle,
}) => {
  const { colors } = useTheme();

  const paymentMethods = useAppSelector((state) => state.paymentMethods);

  const navigation = useNavigation<NavigationProps>();

  if (!paymentMethods.length)
    return (
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <StyledButton
          onPress={() => navigation.navigate("SettingRoutes", { screen: "PaymentMethods" })}
        >
          <StyledText center>DEFINIR MÉTODOS DE PAGO</StyledText>
        </StyledButton>
      </View>
    );

  return (
    <View style={[{ flex: 1 }, containerStyle]}>
      {showPaymentButtonEditing && (
        <TouchableOpacity
          style={[styles.row, styles.edit]}
          onPress={() => navigation.navigate("SettingRoutes", { screen: "PaymentMethods" })}
        >
          <Ionicons name="create-outline" color={colors.primary} size={25} />
          <StyledText style={{ marginLeft: 5 }}>Editar los métodos de pago</StyledText>
        </TouchableOpacity>
      )}
      <FlatList
        data={paymentMethods}
        renderItem={({ item }) => (
          <Button item={item} selected={selected === item.id} onPress={() => onPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  edit: {
    justifyContent: "center",
    paddingVertical: 12,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 21.5,
    width: "auto",
    flexGrow: 1,
    flexBasis: 0,
    marginVertical: 0,
    borderRadius: 0,
    borderWidth: 0.8,
  },
});

export default PaymentButtons;
