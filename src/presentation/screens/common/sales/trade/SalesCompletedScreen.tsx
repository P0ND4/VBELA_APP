import React from "react";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Order } from "domain/entities/data/common/order.entity";
import { Status } from "domain/enums/data/element/status.enums";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";

type SalesCompletedScreenProps = { trade: Order; goBack: () => void; goInvoice: () => void };

const SalesCompletedScreen: React.FC<SalesCompletedScreenProps> = ({
  trade,
  goBack,
  goInvoice,
}) => {
  const { colors } = useTheme();

  return (
    <Layout>
      <View style={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons
          name={trade.status === Status.Completed ? "checkmark-circle-outline" : "time-outline"}
          color={colors.primary}
          size={150}
        />
        <View style={{ marginTop: 15 }}>
          <StyledText subtitle center>
            {trade.status}
          </StyledText>
          {trade.status === Status.Completed && (
            <StyledText color={colors.primary} center>
              Pagado {thousandsSystem(trade.paid)}
            </StyledText>
          )}
          {!!trade.change && (
            <View style={{ marginTop: 25 }}>
              <StyledText center>Vuelto: {thousandsSystem(trade.change)}</StyledText>
              <StyledText center>Total: {thousandsSystem(trade.total)}</StyledText>
            </View>
          )}
        </View>
      </View>
      <View>
        <StyledButton onPress={goInvoice}>
          <StyledText center>Ver factura</StyledText>
        </StyledButton>
        <StyledButton backgroundColor={colors.primary} onPress={goBack}>
          <StyledText color="#FFFFFF" center>
            Regresar
          </StyledText>
        </StyledButton>
      </View>
    </Layout>
  );
};

export default SalesCompletedScreen;
