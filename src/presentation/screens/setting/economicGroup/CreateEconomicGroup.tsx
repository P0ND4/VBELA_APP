import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { RootSetting, SettingRouteProp } from "domain/entities/navigation/root.setting.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch } from "application/store/hook";
import { random } from "shared/utils";
import { add, edit, remove } from "application/slice/settings/economic.group.slice";
import { EconomicGroup } from "domain/entities/data/settings";
import apiClient, { endpoints } from "infrastructure/api/server";
import { Type } from "domain/enums/data/economy/economy.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";

type CreateEconomicGroupProps = {
  navigation: StackNavigationProp<RootSetting>;
  route: SettingRouteProp<"CreateEconomicGroup">;
};

const visibleData = [
  { label: "Ingreso", value: Type.Income },
  { label: "Egreso", value: Type.Egress },
  { label: "Ambos", value: "Ambos" },
];

const CreateEconomicGroup: React.FC<CreateEconomicGroupProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const defaultValue = route.params?.defaultValue;

  const { control, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      visible: defaultValue?.visible || "",
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const [visibleModal, setVisibleModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const { visible } = watch();

  const removeItem = async (id: string) => {
    dispatch(remove({ id }));
    navigation.pop();
    await apiClient({
      url: endpoints.setting.economicGroup.delete(id),
      method: "DELETE",
    });
  };

  useEffect(() => {
    if (defaultValue) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={{ paddingRight: 15 }}
            onPress={() => removeItem(defaultValue.id)}
          >
            <Ionicons name="trash-outline" color={colors.text} size={25} />
          </TouchableOpacity>
        ),
      });
    }
  }, [defaultValue]);

  const save = async (data: EconomicGroup) => {
    dispatch(add(data));
    await apiClient({
      url: endpoints.setting.economicGroup.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: EconomicGroup) => {
    dispatch(edit(data));
    await apiClient({
      url: endpoints.setting.economicGroup.put(data.id),
      method: "PUT",
      data,
    });
  };

  return (
    <>
      <Layout>
        <View style={{ flexGrow: 1 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                placeholder="Nombre"
                maxLength={30}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {formState.errors.name && (
            <StyledText color={colors.primary} verySmall>
              El nombre es requerido
            </StyledText>
          )}
          <StyledButton style={styles.row} onPress={() => setVisibleModal(true)}>
            <StyledText>{visible ? `Visibilidad agregada (${visible})` : "Visibilidad"}</StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          {formState.errors.visible && (
            <StyledText color={colors.primary} verySmall>
              La visibilidad es requerida
            </StyledText>
          )}
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          onPress={handleSubmit((data) => {
            if (!defaultValue) save(data);
            else update(data);
            navigation.pop();
          })}
        >
          <StyledText center color="#FFFFFF">
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="visible"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            data={visibleData}
            title="VISIBLE PARA"
            remove="Remover"
            visible={visibleModal}
            onClose={() => setVisibleModal(false)}
            onSubmit={onChange}
          />
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CreateEconomicGroup;
