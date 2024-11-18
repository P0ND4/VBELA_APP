import React from "react";
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { Element } from "domain/entities/data/common/element.entity";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

type SalesCardProps = {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  data?: Element;
};

const SalesCard: React.FC<SalesCardProps> = ({ onLongPress, onPress, style, data }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.row, style, { height: 55, marginBottom: 15 }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={[
            styles.picture,
            { borderColor: colors.border, backgroundColor: data ? colors.card : "transparent" },
          ]}
        >
          {data?.name ? (
            <StyledText smallParagraph>{data.name.slice(0, 2).toUpperCase()}</StyledText>
          ) : (
            <Ionicons name="add" size={30} color={colors.border} />
          )}
        </View>
        {data?.highlight && (
          <Ionicons name="star" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        )}
        {data?.name && <StyledText verySmall>{data.name}</StyledText>}
      </View>
      <View>
        {(data?.promotion ?? 0) > 0 && (
          <StyledText style={{ textDecorationLine: "line-through" }} verySmall right>
            {thousandsSystem(data?.price || "")}
          </StyledText>
        )}
        {(data?.price ?? 0) > 0 && (
          <StyledText verySmall right>
            {thousandsSystem(data?.promotion || data?.price || "")}
          </StyledText>
        )}
        {(data?.stock ?? 0) > 0 && (
          <StyledText verySmall>
            Stock:{" "}
            <StyledText color={colors.primary} verySmall>
              {thousandsSystem(data?.stock || "")}
            </StyledText>
          </StyledText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  picture: {
    marginRight: 6,
    width: 60,
    height: 40,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SalesCard;
