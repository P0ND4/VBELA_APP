import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch, KeyboardAvoidingView, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  Control,
  Controller,
  UseFormHandleSubmit,
  UseFormStateReturn,
  UseFormWatch,
} from "react-hook-form";
import { thousandsSystem } from "shared/utils";
import { Element, ElementSubCategory } from "domain/entities/data/common/element.entity";
import { unitOptions } from "shared/constants/unit";
import { Group, GroupSubCategory } from "domain/entities/data";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
// import SalesCard from "presentation/screens/common/sales/components/SalesCard";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";

type PickerProps = { label: string; value: string };

type ElementFormProps = {
  groups: Group[];
  onSubmit: (data: Element) => void;
  control: Control<Element>;
  handleSubmit: UseFormHandleSubmit<Element>;
  watch: UseFormWatch<Element>;
  formState: UseFormStateReturn<Element>;
};

const ElementForm: React.FC<ElementFormProps> = ({
  groups,
  onSubmit,
  control,
  handleSubmit,
  watch,
  formState,
}) => {
  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [unitModal, setUnitModal] = useState<boolean>(false);

  const [categoriesPickerModal, setCategoriesPickerModal] = useState<boolean>(false);
  const [subcategoriesPickerModal, setSubcategoriesPickerModal] = useState<boolean>(false);

  const [categoriesPicker, setCategoriesPicker] = useState<PickerProps[]>([]);
  const [subcategoriesPicker, setSubcategoriesPicker] = useState<PickerProps[]>([]);

  const { description, unit, categories, subcategories } = watch();

  useEffect(() => {
    setCategoriesPicker(groups.map((group) => ({ label: group.category, value: group.id })));
  }, [groups]);

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          {/* <SalesCard
            data={watch()}
            onPress={() => alert("Para la cuarta actualización la agregación de imagenes")}
          /> */}
          <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View>
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
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <StyledInput
                      placeholder="Precio de venta"
                      keyboardType="numeric"
                      maxLength={13}
                      onChangeText={(num) => {
                        if (num === "") return onChange("");
                        const numeric = num.replace(/[^0-9]/g, "");
                        onChange(numeric ? parseFloat(numeric) : "");
                      }}
                      onBlur={onBlur}
                      value={thousandsSystem(value || "")}
                    />
                  )}
                />
                {formState.errors.price && (
                  <StyledText color={colors.primary} verySmall>
                    El precio de venta es requerido
                  </StyledText>
                )}
                <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
                  <StyledText>Opcionales</StyledText>
                  <Ionicons name={optional ? "caret-up" : "caret-down"} />
                </StyledButton>
                {optional && (
                  <>
                    <Controller
                      name="cost"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          placeholder="Costo de producción"
                          keyboardType="numeric"
                          maxLength={13}
                          onChangeText={(num) => {
                            if (num === "") return onChange("");
                            const numeric = num.replace(/[^0-9]/g, "");
                            onChange(numeric ? parseFloat(numeric) : "");
                          }}
                          onBlur={onBlur}
                          value={thousandsSystem(value || "")}
                        />
                      )}
                    />
                    <Controller
                      name="promotion"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          placeholder="Precio de promoción"
                          keyboardType="numeric"
                          maxLength={13}
                          onChangeText={(num) => {
                            if (num === "") return onChange("");
                            const numeric = num.replace(/[^0-9]/g, "");
                            onChange(numeric ? parseFloat(numeric) : "");
                          }}
                          onBlur={onBlur}
                          value={thousandsSystem(value || "")}
                        />
                      )}
                    />
                    <StyledButton style={styles.row} onPress={() => setCategoriesPickerModal(true)}>
                      <StyledText>
                        Categoría {!!categories.length && `(${categories.length}) seleccionado`}
                      </StyledText>
                      <Ionicons name="chevron-forward" color={colors.text} size={19} />
                    </StyledButton>
                    <StyledButton
                      style={styles.row}
                      onPress={() => setSubcategoriesPickerModal(true)}
                    >
                      <StyledText>
                        Sub - Categoría{" "}
                        {!!subcategories.length && `(${subcategories.length}) seleccionado`}
                      </StyledText>
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
                    <Controller
                      name="code"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          placeholder="Código"
                          maxLength={12}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                        />
                      )}
                    />
                    <StyledButton style={styles.row} onPress={() => setUnitModal(true)}>
                      <StyledText>{`Vender por ${unit && `(${unit})`}`}</StyledText>
                      <Ionicons name="chevron-forward" color={colors.text} size={19} />
                    </StyledButton>
                    <Controller
                      name="highlight"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <View style={[styles.row, { marginTop: 12 }]}>
                          <StyledText>Destacar producto</StyledText>
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
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          style={{ marginTop: 20 }}
          onPress={handleSubmit(onSubmit)}
        >
          <StyledText center color="#FFFFFF">
            Guardar producto
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InputScreenModal
            visible={descriptionModal}
            defaultValue={value}
            onClose={() => setDescriptionModal(false)}
            title="Descripción"
            placeholder="Escribe tu descripción"
            onSubmit={onChange}
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
              const subcategoriesPicker = groups
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
                groups.flatMap((group: Group) =>
                  group.subcategories.map((sub: GroupSubCategory) => [sub.id, group.id]),
                ),
              );
              const elementSubcategories: ElementSubCategory[] = subcategoryIDS.map(
                (id: string) => ({
                  category: categoriesMap.get(id)!,
                  subcategory: id,
                }),
              );
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  descriptionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  uniModalEdit: {
    justifyContent: "center",
    paddingVertical: 12,
  },
});

export default ElementForm;
