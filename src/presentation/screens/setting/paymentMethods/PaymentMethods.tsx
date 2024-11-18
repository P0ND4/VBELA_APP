import React, { useEffect } from "react";
import { TouchableOpacity, FlatList } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import { PaymentMethods as PaymentMethodsType } from "domain/entities/data/settings/payment.methods.entity";
import { RootSetting, SettingNavigationProp } from "domain/entities/navigation/root.setting.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";

type NavigationProps = StackNavigationProp<RootSetting>;

const Card: React.FC<{ item: PaymentMethodsType }> = ({ item }) => {
  const { colors } = useTheme();

  const navigation = useNavigation<NavigationProps>();

  return (
    <StyledButton
      style={{ flexDirection: "row", alignItems: "center" }}
      onPress={() => navigation.navigate("CreatePaymentMethod", { defaultValue: item })}
    >
      <Ionicons name={item.icon} size={32} color={colors.text} />
      <StyledText style={{ marginLeft: 10 }}>{item.name}</StyledText>
    </StyledButton>
  );
};

const PaymentMethods: React.FC<SettingNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const paymentMethods = useAppSelector((state) => state.paymentMethods);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => navigation.navigate("CreatePaymentMethod")}
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <Layout>
      {!paymentMethods.length ? (
        <StyledText color={colors.primary}>NO HAY MÉTODOS DE PAGOS REGISTRADOS</StyledText>
      ) : (
        <FlatList
          data={paymentMethods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} />}
        />
      )}
    </Layout>
  );
};

export default PaymentMethods;
