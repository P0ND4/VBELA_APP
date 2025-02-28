import React, { useState } from "react";
import { StyleSheet, View, Switch } from "react-native";
import { Controller, useForm } from "react-hook-form";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { Inventory } from "domain/entities/data/inventories";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import { random, thousandsSystem } from "shared/utils";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import { useAppDispatch } from "application/store/hook";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import { add, edit } from "application/slice/inventories/inventories.slice";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import apiClient, { endpoints } from "infrastructure/api/server";

const visibleData = [
  { label: "Ambos", value: Visible.Both },
  { label: "Restaurantes", value: Visible.Restaurant },
  { label: "Tiendas", value: Visible.Store },
  { label: "Ninguno", value: Visible.None },
];

type CreateInventoryProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateInventory">;
};

const CreateInventory: React.FC<CreateInventoryProps> = ({ navigation, route }) => {
  const defaultValue = route.params?.inventory;

  const { control, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      visible: defaultValue?.visible || Visible.Both,
      description: defaultValue?.description || "",
      highlight: defaultValue?.highlight || false,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);

  const { description, visible } = watch();

  const dispatch = useAppDispatch();

  const save = async (data: Inventory) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.inventory.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Inventory) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.inventory.put(data.id),
      method: "PUT",
      data,
    });
  };

  const handleSaveOrUpdate = (data: Inventory) => (defaultValue ? update(data) : save(data));

  return (
    <>
      <Layout>
        <View style={{ flex: 1 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                placeholder="Nombre del inventario"
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
          <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
            <StyledText>Opcionales</StyledText>
            <Ionicons name={optional ? "caret-up" : "caret-down"} color={colors.text} />
          </StyledButton>
          {optional && (
            <>
              <StyledButton style={styles.row} onPress={() => setDescriptionModal(true)}>
                <StyledText>
                  {description
                    ? `Descripción agregada (${thousandsSystem(description.length)} letras)`
                    : "Descripción"}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <StyledButton style={styles.row} onPress={() => setVisibleModal(true)}>
                <StyledText>Visible para ({visible})</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <Controller
                name="highlight"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.row, { marginTop: 12 }]}>
                    <StyledText>Destacar inventario</StyledText>
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      thumbColor={value ? colors.primary : colors.card}
                    />
                  </View>
                )}
              />
            </>
          )}
        </View>
        <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(handleSaveOrUpdate)}>
          <StyledText center color="#FFFFFF">
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InputScreenModal
            title="Descripción"
            placeholder="Creá una buena descripción para tu inventario"
            visible={descriptionModal}
            defaultValue={value}
            maxLength={3000}
            onClose={() => setDescriptionModal(false)}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="visible"
        control={control}
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

export default CreateInventory;
