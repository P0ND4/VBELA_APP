import React, { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@react-navigation/native";
import { changeDate, random, thousandsSystem } from "shared/utils";
import { Economy } from "domain/entities/data/economies/economy.entity";
import { unitOptions } from "shared/constants/unit";
import { Type } from "domain/enums/data/economy/economy.enums";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootEconomy, EconomyRouteProp } from "domain/entities/navigation/root.economy.entity";
import { add, edit } from "application/slice/economies/economies.slice";
import apiClient, { endpoints } from "infrastructure/api/server";
import { EconomicGroup } from "domain/entities/data";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import SimpleCalendarModal from "presentation/components/modal/SimpleCalendarModal";
import InputScreenModal from "presentation/components/modal/InputScreenModal";

type CreateEconomyProps = {
  navigation: StackNavigationProp<RootEconomy>;
  route: EconomyRouteProp<"CreateEconomy">;
};

type PickerType = { label: string; value: string }[];

const CreateEconomy: React.FC<CreateEconomyProps> = ({ navigation, route }) => {
  const suppliers = useAppSelector((state) => state.suppliers);
  const economicGroup = useAppSelector((state) => state.economicGroup);

  const defaultValue = route.params?.economy;
  const type = route.params?.type;

  const { control, watch, handleSubmit, setValue, formState } = useForm<Economy>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      supplier: defaultValue?.supplier || null,
      type,
      category: defaultValue?.category || undefined,
      subcategory: defaultValue?.subcategory || null,
      value: defaultValue?.value || 0,
      quantity: defaultValue?.quantity || 0,
      unit: defaultValue?.unit || "",
      description: defaultValue?.description || "",
      date: defaultValue?.date || new Date().getTime(),
      reference: defaultValue?.reference || "",
      brand: defaultValue?.brand || "",
      operative: defaultValue?.operative || true,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const [economicCategoryData, setEconomicCategoryData] = useState<PickerType>([]);
  const [economicSubCategoryData, setEconomicSubCategoryData] = useState<PickerType>([]);
  const [supplierData, setSupplierData] = useState<PickerType>([]);

  const [optional, setOptional] = useState<boolean>(false);
  const [supplierModal, setSupplierModal] = useState<boolean>(false);
  const [currentValueModal, setCurrentValueModal] = useState<boolean>(false);
  const [unitModal, setUnitModal] = useState<boolean>(false);
  const [calendarModal, setCalendarModal] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [quantityModal, setQuantityModal] = useState<boolean>(false);
  const [economicModal, setEconomicModal] = useState<boolean>(false);
  const [economicSubCategoryModal, setEconomicSubCategoryModal] = useState<boolean>(false);

  const { supplier, unit, value, date, description, category, quantity, subcategory } = watch();

  const dispatch = useAppDispatch();

  const changeSubcategoryData = useCallback((economic: EconomicGroup | undefined) => {
    setEconomicSubCategoryData(
      economic?.subcategories?.map((subcategory) => ({
        label: subcategory.name,
        value: subcategory.id,
      })) ?? [],
    );
  }, []);

  useEffect(() => {
    const data = economicGroup
      .filter((e) => e.visible === type || e.visible === Type.Both)
      .map((e) => ({ label: e.category, value: e.id }));
    setEconomicCategoryData(data);
  }, [type]);

  useEffect(() => {
    if (defaultValue && category?.id) {
      const economic = economicGroup.find((s) => s.id === category.id);
      changeSubcategoryData(economic);
    }
  }, [defaultValue, category?.id, changeSubcategoryData]);

  useEffect(() => {
    const data = suppliers.map((s) => ({ label: s.name, value: s.id }));
    setSupplierData(data);
  }, [suppliers]);

  useEffect(() => {
    navigation.setOptions({ title: `Registrar: ${type === Type.Income ? "Ingreso" : "Egreso"}` });
  }, [type]);

  const isRequired = (value: any) => !!value;

  const save = async (data: Economy) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.economy.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Economy) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.economy.put(data.id),
      method: "PUT",
      data,
    });
  };

  const handleSaveOrUpdate = (data: Economy) => (defaultValue ? update(data) : save(data));

  return (
    <>
      <Layout>
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <StyledButton style={styles.row} onPress={() => setEconomicModal(true)}>
                <StyledText numberOfLines={1} ellipsizeMode="tail">
                  {category ? `Categoría (${category.name})` : "Seleccione la categoría"}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              {formState.errors.category && (
                <StyledText color={colors.primary} verySmall>
                  La categoría es requerido
                </StyledText>
              )}
              <StyledButton style={styles.row} onPress={() => setQuantityModal(true)}>
                <StyledText>Cantidad {!!quantity && `(${thousandsSystem(quantity)})`}</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              {formState.errors.quantity && (
                <StyledText color={colors.primary} verySmall>
                  La cantidad es requerida
                </StyledText>
              )}
              <StyledButton style={styles.row} onPress={() => setCurrentValueModal(true)}>
                <StyledText>Valor {!!value && `(${thousandsSystem(value)})`}</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              {formState.errors.value && (
                <StyledText color={colors.primary} verySmall>
                  El valor por unidad es requerida
                </StyledText>
              )}
              <StyledButton style={styles.row} onPress={() => setCalendarModal(true)}>
                <StyledText>Fecha {date && `(${changeDate(new Date(date))})`}</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              {formState.errors.date && (
                <StyledText color={colors.primary} verySmall>
                  La fecha es requerida
                </StyledText>
              )}
              <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
                <StyledText>Opcionales</StyledText>
                <Ionicons name={optional ? "caret-up" : "caret-down"} color={colors.text} />
              </StyledButton>
              {optional && (
                <>
                  <StyledButton
                    style={styles.row}
                    onPress={() => setEconomicSubCategoryModal(true)}
                  >
                    <StyledText numberOfLines={1} ellipsizeMode="tail">
                      {subcategory
                        ? `Sub-Categoría (${subcategory.name})`
                        : "Seleccione la subcategoría"}
                    </StyledText>
                    <Ionicons name="chevron-forward" color={colors.text} size={19} />
                  </StyledButton>
                  <StyledButton style={styles.row} onPress={() => setSupplierModal(true)}>
                    <StyledText>{supplier ? supplier.name : "Proveedor"}</StyledText>
                    <Ionicons name="chevron-forward" color={colors.text} size={19} />
                  </StyledButton>
                  <StyledButton style={styles.row} onPress={() => setDescriptionModal(true)}>
                    <StyledText>
                      {description
                        ? `Descripción agregada (${thousandsSystem(description.length)} letras)`
                        : "Descripción"}
                    </StyledText>
                    <Ionicons name="chevron-forward" color={colors.text} size={19} />
                  </StyledButton>
                  <StyledButton style={styles.row} onPress={() => setUnitModal(true)}>
                    <StyledText>Unidad {unit && `(${unit})`}</StyledText>
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
                  <Controller
                    name="operative"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.row, { marginTop: 12 }]}>
                        <StyledText>{type} operativo</StyledText>
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
          </KeyboardAvoidingView>
        </View>
        <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(handleSaveOrUpdate)}>
          <StyledText center color="#FFFFFF">
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="supplier"
        control={control}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE EL PROVEEDOR"
            remove="Remover proveedor"
            noData="NO HAY PROVEEDORES"
            visible={supplierModal}
            onClose={() => setSupplierModal(false)}
            data={supplierData}
            onSubmit={(supplierID) => {
              const supplier = suppliers.find((s) => s.id === supplierID);
              onChange(supplier ? { id: supplier.id, name: supplier.name } : null);
            }}
          />
        )}
      />
      <Controller
        name="quantity"
        control={control}
        rules={{ validate: isRequired }}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Cantidad"
            description={() =>
              `Defina la cantidad de ${type === Type.Income ? "ingreso" : "egreso"}`
            }
            decimal={true}
            visible={quantityModal}
            defaultValue={value}
            isRemove={!!value}
            maxValue={999999}
            onClose={() => setQuantityModal(false)}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InputScreenModal
            title="Descripción"
            placeholder="Creá una buena descripción"
            visible={descriptionModal}
            defaultValue={value}
            maxLength={500}
            onClose={() => setDescriptionModal(false)}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="date"
        rules={{ validate: isRequired }}
        control={control}
        render={({ field: { onChange, value } }) => (
          <SimpleCalendarModal
            defaultValue={value}
            visible={calendarModal}
            onClose={() => setCalendarModal(false)}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="value"
        rules={{ validate: isRequired }}
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Valor"
            negativeNumber={type === Type.Egress}
            description={() => "Defina valor actual por unidad"}
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
        name="category"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE LA CATEGORÍA"
            remove="Remover categoría"
            noData="NO HAY CATEGORÍAS CREADAS"
            visible={economicModal}
            onClose={() => setEconomicModal(false)}
            data={economicCategoryData}
            onSubmit={(categoryID) => {
              const economic = economicGroup.find((s) => s.id === categoryID);
              changeSubcategoryData(economic);
              setValue("subcategory", null);
              onChange(economic ? { id: economic.id, name: economic.category } : undefined);
            }}
          />
        )}
      />
      <Controller
        name="subcategory"
        control={control}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE LA SUBCATEGORÍA"
            remove="Remover subcategoría"
            noData="NO HAY SUBCATEGORÍAS"
            visible={economicSubCategoryModal}
            onClose={() => setEconomicSubCategoryModal(false)}
            data={economicSubCategoryData}
            onSubmit={(subcategoryID) => {
              const economic = economicGroup.find((s) => s.id === category.id);
              const subcategory = economic?.subcategories.find((sub) => sub.id === subcategoryID);
              onChange(subcategory ? { id: subcategory.id, name: subcategory.name } : null);
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

export default CreateEconomy;
