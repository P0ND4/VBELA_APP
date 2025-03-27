import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@react-navigation/native";
import { random } from "shared/utils";
import type { Group } from "domain/entities/data";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import InformationModal from "presentation/components/modal/InformationModal";

type GroupFormProps = {
  ownerID: string;
  defaultValue?: Group;
  onSave: (data: Group) => void;
  onUpdate: (data: Group) => void;
};

const GroupForm: React.FC<GroupFormProps> = ({ ownerID, onSave, onUpdate, defaultValue }) => {
  const { control, handleSubmit, watch, setValue, formState } = useForm<Group>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      ownerID,
      category: defaultValue?.category || "",
      subcategories: defaultValue?.subcategories || [],
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();
  const { subcategories } = watch();

  const [subcategoryModal, setSubcategoryModal] = useState<boolean>(false);
  const [subcategoryName, setSubcategoryName] = useState<string>("");
  const [subcategoryError, setSubcategoryError] = useState<boolean>(false);
  const [subcategoryEditing, setSubcategoryEditing] = useState<null | string>(null);

  const handleSaveOrUpdate = (data: any) => (defaultValue ? onUpdate(data) : onSave(data));

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
        <View style={{ flex: 1 }}>
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
        <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(handleSaveOrUpdate)}>
          <StyledText center color="#FFFFFF">
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
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

export default GroupForm;
