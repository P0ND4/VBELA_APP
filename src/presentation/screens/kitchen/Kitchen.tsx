import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { thousandsSystem } from "shared/utils";
import {
  selectConfirmedOrder,
  selectProcessingOrder,
  selectRequestedOrder,
} from "application/selectors";

import { Status } from "domain/enums/data/kitchen/status.enums";
import StyledText from "presentation/components/text/StyledText";
import KitchenScreen from "../common/kitchens/KitchenScreen";

const Tab = createMaterialTopTabNavigator();

//TODO EN DELIVERY TENEMOS 3 ESTADOS: ESPERANDO (Llevado por - agregar), ENVIADO Y ENTREGADO.

const Kitchen: React.FC = () => {
  const { colors } = useTheme();

  const requested = useAppSelector(selectRequestedOrder);
  const processing = useAppSelector(selectProcessingOrder);
  const confirmed = useAppSelector(selectConfirmedOrder);

  const BadgeIcon: React.FC<{ count: number }> = ({ count }) => (
    <View style={[styles.order, { backgroundColor: colors.primary }]}>
      <StyledText verySmall color="#FFFFFF">
        {thousandsSystem(count)}
      </StyledText>
    </View>
  );

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="SOLICITADO"
        options={{
          tabBarBadge: () => requested.length > 0 && <BadgeIcon count={requested.length} />,
        }}
      >
        {() => <KitchenScreen orders={requested} status={Status.Processing} />}
      </Tab.Screen>
      <Tab.Screen
        name="PROCESANDO"
        options={{
          tabBarBadge: () => processing.length > 0 && <BadgeIcon count={processing.length} />,
        }}
      >
        {() => <KitchenScreen orders={processing} status={Status.Confirmed} />}
      </Tab.Screen>
      <Tab.Screen
        name="CONFIRMADO"
        options={{
          tabBarBadge: () => confirmed.length > 0 && <BadgeIcon count={confirmed.length} />,
        }}
      >
        {() => <KitchenScreen orders={confirmed} status={Status.Completed} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  order: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    right: 5,
    top: 13,
  },
});

export default Kitchen;
