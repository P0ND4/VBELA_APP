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
import InformationModal from "presentation/components/modal/InformationModal";

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

  const { control, handleSubmit, setValue, watch, formState } = useForm<EconomicGroup>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      category: defaultValue?.category || "",
      subcategories: defaultValue?.subcategories || [],
      visible: defaultValue?.visible || "",
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [subcategoryModal, setSubcategoryModal] = useState<boolean>(false);
  const [subcategoryName, setSubcategoryName] = useState<string>("");
  const [subcategoryError, setSubcategoryError] = useState<boolean>(false);
  const [subcategoryEditing, setSubcategoryEditing] = useState<null | string>(null);

  const dispatch = useAppDispatch();

  const { visible, subcategories } = watch();

  const removeItem = async (id: string) => {
    dispatch(remove({ id }));
    navigation.pop();
    await apiClient({
      url: endpoints.economicGroup.delete(id),
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
      url: endpoints.economicGroup.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: EconomicGroup) => {
    dispatch(edit(data));
    await apiClient({
      url: endpoints.economicGroup.put(data.id),
      method: "PUT",
      data,
    });
  };

  const onClose = () => {
    setSubcategoryModal(false);
    setSubcategoryName("");
    setSubcategoryError(false);
    setSubcategoryEditing(null);
  };

  const updateSubcategory = () => {
    if (!subcategoryName.length) return setSubcategoryError(true);
    const subcategory = { id: subcategoryEditing as string, name: subcategoryName };
    setValue(
      "subcategories",
      subcategories.map((s) => (s.id === subcategoryEditing ? subcategory : s)),
    );
    onClose();
  };

  const removeSubcategory = (id: string) => {
    setValue(
      "subcategories",
      subcategories.filter((s) => s.id !== id),
    );
  };

  const addSubcategory = () => {
    if (!subcategoryName.length) return setSubcategoryError(true);
    setValue("subcategories", [...subcategories, { id: random(10), name: subcategoryName }]);
    onClose();
  };

  return (
    <>
      <Layout>
        <View style={{ flexGrow: 1 }}>
          <Controller
            name="category"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                placeholder="Categoría"
                maxLength={30}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {formState.errors.category && (
            <StyledText color={colors.primary} verySmall>
              La categoría es requerida
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
          <View style={styles.subcategoryContainer}>
            {subcategories.map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[styles.subcategory, { backgroundColor: colors.card }]}
                onPress={() => {
                  setSubcategoryEditing(subcategory.id);
                  setSubcategoryName(subcategory.name);
                  setSubcategoryModal(true);
                }}
                onLongPress={() => removeSubcategory(subcategory.id)}
              >
                <StyledText>{subcategory.name}</StyledText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSubcategoryModal(true)}
              style={[styles.subcategory, { backgroundColor: colors.card }]}
            >
              <Ionicons name="add" color={colors.primary} size={19} />
            </TouchableOpacity>
            {!subcategories.length && (
              <StyledText smallParagraph color={colors.border} style={{ marginLeft: 10 }}>
                Preciona "+" para agregar una subcategoría
              </StyledText>
            )}
          </View>
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          loading={loading}
          onPress={handleSubmit((data) => {
            setLoading(true);
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
      <InformationModal
        title="Subcategoría"
        animationType="fade"
        visible={subcategoryModal}
        onClose={onClose}
      >
        <StyledInput
          placeholder="Nombre"
          value={subcategoryName}
          onChangeText={setSubcategoryName}
          maxLength={30}
        />
        {subcategoryError && (
          <StyledText color={colors.primary} verySmall>
            El nombre de la subcategoría es obligatorio
          </StyledText>
        )}
        <StyledButton
          backgroundColor={colors.primary}
          onPress={subcategoryEditing ? updateSubcategory : addSubcategory}
        >
          <StyledText center color="#FFFFFF">
            Agregar
          </StyledText>
        </StyledButton>
      </InformationModal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subcategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subcategory: {
    marginBottom: 4,
    marginRight: 4,
    paddingVertical: 2,
    paddingHorizontal: 12,
    minWidth: 80,
    borderRadius: 4,
    alignItems: "center",
  },
});

export default CreateEconomicGroup;
