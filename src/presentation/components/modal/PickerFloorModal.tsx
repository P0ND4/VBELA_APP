import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import FloorModal from "./FloorModal";
import StyledText from "../text/StyledText";
import StyledButton from "../button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledInput from "../input/StyledInput";

type Icons = keyof typeof Ionicons.glyphMap;

type Data = {
  icon?: Icons;
  iconColor?: string;
  textColor?: string;
  label: string;
  value: string;
};

type PickerFloorModalProps = {
  title: string;
  remove?: string;
  noData?: string;
  multiple?: string[];
  visible: boolean;
  isRemove?: boolean;
  onClose: () => void;
  onSubmit: (value: string | string[]) => void;
  data: Data[];
};

const PickerFloorModal: React.FC<PickerFloorModalProps> = ({
  title,
  remove,
  multiple,
  visible,
  noData,
  data,
  isRemove = true,
  onSubmit,
  onClose,
}) => {
  const { colors } = useTheme();

  const [search, setSearch] = useState("");
  const [found, setFound] = useState<Data[]>(data);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let found = data;
    if (search) {
      found = found.filter((element) => element.label.toLowerCase().includes(search.toLowerCase()));
    }

    setFound(found);
  }, [data, search]);

  useEffect(() => {
    visible && multiple && setSelected(multiple);
  }, [visible]);

  const isDataAvailable = !!data.length;

  return (
    <FloorModal style={{ height: "90%" }} title={title} visible={visible} onClose={onClose}>
      {!data.length && <StyledText color={colors.primary}>{noData}</StyledText>}
      {isDataAvailable && (
        <>
          <StyledInput
            left={() => <Ionicons name="search" color={colors.text} size={22} />}
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
          />
          {!found.length && (
            <StyledText color={colors.primary}>NO HAY DATOS PARA LA BÚSQUEDA</StyledText>
          )}
          <FlatList
            data={found}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[{ paddingVertical: 14 }, styles.row]}
                onPress={() => {
                  if (multiple) {
                    setSelected((prev) =>
                      prev.includes(item.value)
                        ? prev.filter((i) => i !== item.value)
                        : [...prev, item.value],
                    );
                  } else {
                    onSubmit(item.value);
                    onClose();
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <StyledText color={item.textColor || colors.text}>{item.label}</StyledText>
                  {item.icon && (
                    <Ionicons
                      name={item.icon}
                      color={item.iconColor || colors.text}
                      size={24}
                      style={{ marginRight: 15 }}
                    />
                  )}
                </View>
                {selected.includes(item.value) && (
                  <Ionicons name="checkmark" color={colors.primary} size={19} />
                )}
              </TouchableOpacity>
            )}
            style={{ flexGrow: 1, marginVertical: 5 }}
            ItemSeparatorComponent={() => (
              <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
            )}
          />
          <View>
            {isRemove && (
              <StyledButton
                onPress={() => {
                  onSubmit(multiple ? [] : "");
                  onClose();
                }}
              >
                <StyledText center>{remove}</StyledText>
              </StyledButton>
            )}
            {multiple && (
              <StyledButton
                backgroundColor={colors.primary}
                onPress={() => {
                  onSubmit(selected);
                  onClose();
                }}
              >
                <StyledText color="#FFFFFF" center>
                  Guardar
                </StyledText>
              </StyledButton>
            )}
          </View>
        </>
      )}
    </FloorModal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default PickerFloorModal;
