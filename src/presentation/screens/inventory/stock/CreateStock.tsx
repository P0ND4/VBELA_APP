import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { StyleSheet, Switch, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { random, thousandsSystem } from "shared/utils";
import { useAppDispatch } from "application/store/hook";
import { Stock } from "domain/entities/data/inventories";
import { add, edit } from "application/slice/inventories/stocks.slice";
import { unitOptions, UnitValue } from "shared/constants/unit";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import apiClient, { endpoints } from "infrastructure/api/server";

type CreateStockProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateStock">;
};

const CreateStock: React.FC<CreateStockProps> = ({ navigation, route }) => {
  const defaultValue = route.params?.stock;
  const inventoryID = route.params.inventoryID;

  const { control, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      inventoryID,
      name: defaultValue?.name || "",
      unit: (defaultValue?.unit || "") as UnitValue,
      visible: defaultValue?.visible || true,
      reorder: defaultValue?.reorder || 0,
      reference: defaultValue?.reference || "",
      brand: defaultValue?.brand || "",
      currentValue: defaultValue?.currentValue || 0,
      movements: defaultValue?.movements || [],
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [reorderModal, setReorderModal] = useState<boolean>(false);
  const [currentValueModal, setCurrentValueModal] = useState<boolean>(false);
  const [unitModal, setUnitModal] = useState<boolean>(false);

  const { unit, reorder, currentValue } = watch();

  const dispatch = useAppDispatch();

  const save = async (data: Stock) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.stock.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Stock) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.stock.put(),
      method: "PUT",
      data,
    });
  };

  const handleSaveOrUpdate = (data: Stock) => (defaultValue ? update(data) : save(data));

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
                placeholder="Nombre del stock"
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
              <StyledButton style={styles.row} onPress={() => setUnitModal(true)}>
                <StyledText>Unidad {unit && `(${unit})`}</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <StyledButton style={styles.row} onPress={() => setReorderModal(true)}>
                <StyledText>
                  Punto de reorden {!!reorder && `(${thousandsSystem(reorder)})`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <Controller
                name="reference"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="Referencia"
                    maxLength={30}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <Controller
                name="brand"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="Marca"
                    maxLength={30}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <StyledButton style={styles.row} onPress={() => setCurrentValueModal(true)}>
                <StyledText>
                  Valor actual {!!currentValue && `(${thousandsSystem(currentValue)})`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <Controller
                name="visible"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.row, { marginTop: 12 }]}>
                    <StyledText>Visibilidad en inventario</StyledText>
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
        name="reorder"
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Punto de reorden"
            description={() => "Defina el punto de reorden"}
            visible={reorderModal}
            defaultValue={value}
            isRemove={!!value}
            maxValue={999999}
            onClose={() => setReorderModal(false)}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="currentValue"
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Valor actual"
            description={() => "Defina valor actual"}
            visible={currentValueModal}
            defaultValue={value}
            isRemove={!!value}
            maxValue={9999999999}
            onClose={() => setCurrentValueModal(false)}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="unit"
        control={control}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE LA UNIDAD"
            remove="Remover unidad"
            visible={unitModal}
            onClose={() => setUnitModal(false)}
            data={unitOptions}
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

export default CreateStock;
