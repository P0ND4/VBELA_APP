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

  const displayName = data?.name?.slice(0, 2).toUpperCase() || (
    <Ionicons name="add" size={30} color={colors.border} />
  );

  return (
    <TouchableOpacity
      style={[styles.row, style, { height: 55, marginBottom: 15 }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.picture,
            { borderColor: colors.border, backgroundColor: data ? colors.card : "transparent" },
          ]}
        >
          <StyledText smallParagraph>{displayName}</StyledText>
        </View>
        {data?.name && <StyledText verySmall>{data.name}</StyledText>}
      </View>

      <View>
        {!!data?.promotion && (
          <StyledText style={styles.lineThrough} verySmall right>
            {thousandsSystem(data.price || "")}
          </StyledText>
        )}
        {!!data?.price && (
          <StyledText verySmall right>
            {thousandsSystem(data?.promotion || data?.price || "")}
          </StyledText>
        )}
        {!!data?.stock && !!data?.minStock && (
          <StyledText verySmall>
            Stock:{" "}
            <StyledText
              verySmall
              color={data?.stock >= data?.minStock ? colors.text : colors.primary}
            >
              {thousandsSystem(data?.stock)}/{thousandsSystem(data?.minStock)}
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
  content: {
    flexDirection: "row",
    alignItems: "center",
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
  lineThrough: {
    textDecorationLine: "line-through",
  },
});

export default SalesCard;
