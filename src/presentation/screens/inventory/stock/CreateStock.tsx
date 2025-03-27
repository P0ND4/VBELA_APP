import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { random, thousandsSystem } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Stock, StockSubCategory } from "domain/entities/data/inventories";
import { add, edit } from "application/slice/inventories/stocks.slice";
import { unitOptions, UnitValue } from "shared/constants/unit";
import apiClient, { endpoints } from "infrastructure/api/server";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import { Group, GroupSubCategory } from "domain/entities/data";

type CreateStockProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateStock">;
};

type PickerProps = { label: string; value: string };

const CreateStock: React.FC<CreateStockProps> = ({ navigation, route }) => {
  const defaultValue = route.params?.stock;
  const inventoryID = route.params.inventoryID;

  const { control, handleSubmit, watch, formState } = useForm<Stock>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      inventoryID,
      name: defaultValue?.name || "",
      unit: (defaultValue?.unit || "") as UnitValue,
      categories: defaultValue?.categories || [],
      subcategories: defaultValue?.subcategories || [],
      visible: defaultValue?.visible || true,
      reorder: defaultValue?.reorder || 0,
      reference: defaultValue?.reference || "",
      brand: defaultValue?.brand || "",
      currentValue: defaultValue?.currentValue || 0,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const stockGroup = useAppSelector((state) => state.stockGroup);

  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [reorderModal, setReorderModal] = useState<boolean>(false);
  const [currentValueModal, setCurrentValueModal] = useState<boolean>(false);
  const [unitModal, setUnitModal] = useState<boolean>(false);
  const [categoriesPickerModal, setCategoriesPickerModal] = useState<boolean>(false);
  const [subcategoriesPickerModal, setSubcategoriesPickerModal] = useState<boolean>(false);

  const [categoriesPicker, setCategoriesPicker] = useState<PickerProps[]>([]);
  const [subcategoriesPicker, setSubcategoriesPicker] = useState<PickerProps[]>([]);

  const { unit, categories, subcategories, reorder, currentValue } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    setCategoriesPicker(stockGroup.map((group) => ({ label: group.category, value: group.id })));
  }, [stockGroup]);

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
      url: endpoints.stock.put(data.id),
      method: "PUT",
      data,
    });
  };

  const handleSaveOrUpdate = (data: Stock) => (defaultValue ? update(data) : save(data));

  return (
    <>
      <Layout>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
              <StyledButton style={styles.row} onPress={() => setCategoriesPickerModal(true)}>
                <StyledText>
                  Categoría {!!categories.length && `(${categories.length}) seleccionado`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <StyledButton style={styles.row} onPress={() => setSubcategoriesPickerModal(true)}>
                <StyledText>
                  Sub - Categoría{" "}
                  {!!subcategories.length && `(${subcategories.length}) seleccionado`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
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
        </ScrollView>
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
      <Controller
        name="categories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            data={categoriesPicker}
            multiple={value}
            title="CATEGORÍA"
            remove="Remover"
            noData="NO HAY CATEGORÍAS CREADAS"
            visible={categoriesPickerModal}
            onClose={() => setCategoriesPickerModal(false)}
            onSubmit={(categoryIDS) => {
              const subcategoriesPicker = stockGroup
                .filter((g) => categoryIDS.includes(g.id))
                .flatMap((c) => c.subcategories.map((s) => ({ label: s.name, value: s.id })));

              setSubcategoriesPicker(subcategoriesPicker);
              onChange(categoryIDS);
            }}
          />
        )}
      />
      <Controller
        name="subcategories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            data={subcategoriesPicker}
            multiple={value.map((va) => va.subcategory)}
            title="SUB - CATEGORÍAS"
            remove="Remover"
            noData="NO HAY SUB - CATEGORÍAS DISPONIBLES"
            visible={subcategoriesPickerModal}
            onClose={() => setSubcategoriesPickerModal(false)}
            onSubmit={(value) => {
              const subcategoryIDS = Array.isArray(value) ? value : [value];

              const categoriesMap = new Map<string, string>(
                stockGroup.flatMap((group: Group) =>
                  group.subcategories.map((sub: GroupSubCategory) => [sub.id, group.id]),
                ),
              );
              const elementSubcategories: StockSubCategory[] = subcategoryIDS.map((id: string) => ({
                category: categoriesMap.get(id)!,
                subcategory: id,
              }));
              onChange(elementSubcategories);
            }}
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
