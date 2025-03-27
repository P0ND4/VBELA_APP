import React, { useCallback } from "react";
import { View, FlatList, StyleSheet, ListRenderItem, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import { GroupSubCategory, Group } from "domain/entities/data";
import StyledButton from "../button/StyledButton";
import StyledText from "../text/StyledText";

type GroupSectionProps = {
  style?: StyleProp<ViewStyle>;
  groups: Group[];
  group: Group | null;
  subGroup: GroupSubCategory | null;
  onPressCreateGroup: (group?: Group) => void;
  onPressGroup: (group: Group) => void;
  onPressSubGroup: (subGroup: GroupSubCategory) => void;
};

const GroupSection: React.FC<GroupSectionProps> = ({
  style,
  groups,
  group,
  subGroup,
  onPressCreateGroup,
  onPressGroup,
  onPressSubGroup,
}) => {
  const { colors } = useTheme();

  const renderItemCategory: ListRenderItem<Group> = useCallback(
    ({ item }) => (
      <StyledButton
        style={styles.group}
        backgroundColor={group?.id === item.id ? colors.primary : colors.card}
        onLongPress={() => onPressCreateGroup(item)}
        onPress={() => onPressGroup(item)}
      >
        <StyledText verySmall color={group?.id === item.id ? "#FFFFFF" : colors.text}>
          {item.category}
        </StyledText>
      </StyledButton>
    ),
    [group],
  );

  const renderItemSubCategory: ListRenderItem<GroupSubCategory> = useCallback(
    ({ item }) => (
      <StyledButton
        style={styles.group}
        backgroundColor={subGroup?.id === item.id ? colors.primary : colors.card}
        onPress={() => onPressSubGroup(item)}
      >
        <StyledText verySmall color={subGroup?.id === item.id ? "#FFFFFF" : colors.text}>
          {item.name}
        </StyledText>
      </StyledButton>
    ),
    [subGroup],
  );

  return (
    <View style={style}>
      <View style={styles.row}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          data={groups}
          horizontal
          keyExtractor={(group) => group.id}
          renderItem={renderItemCategory}
        />
        <StyledButton
          style={[styles.group, { marginLeft: 5 }]}
          backgroundColor={colors.primary}
          onPress={() => onPressCreateGroup()}
        >
          <StyledText verySmall color="#FFFFFF">
            + Categoría
          </StyledText>
        </StyledButton>
      </View>
      {group && (
        <FlatList
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          data={group.subcategories}
          horizontal
          keyExtractor={(group) => group.id}
          renderItem={renderItemSubCategory}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  group: {
    width: "auto",
    marginRight: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
    alignItems: "center",
  },
});

export default GroupSection;
