import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { Location } from "domain/entities/data/common";
import { random, thousandsSystem } from "shared/utils";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";

type CreateLocationProps = {
  defaultValue?: Location;
  visible: Visible;
  onSave: (data: Location) => void;
  onUpdate: (data: Location) => void;
};

const CreateLocation: React.FC<CreateLocationProps> = ({
  onSave,
  onUpdate,
  visible,
  defaultValue,
}) => {
  const { control, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      description: defaultValue?.description || "",
      highlight: defaultValue?.highlight || false,
      inventories: defaultValue?.inventories || [],
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const inventories = useAppSelector((state) => state.inventories);

  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [inventoryModal, setInventoryModal] = useState<boolean>(false);

  const [data, setData] = useState<{ label: string; value: string }[]>([]); // INVENTORIES DATA

  const { description, inventories: inv } = watch();

  const handleSaveOrUpdate = (data: Location) => (defaultValue ? onUpdate(data) : onSave(data));

  useEffect(() => {
    const found = inventories.filter((i) => [Visible.Both, visible].includes(i.visible));
    const data = found.map((f) => ({ label: f.name, value: f.id }));
    setData(data);
  }, [inventories]);

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
                placeholder="Nombre de la localidad"
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
            <Ionicons name={optional ? "caret-up" : "caret-down"} />
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
              <StyledButton style={styles.row} onPress={() => setInventoryModal(true)}>
                <StyledText>
                  {!inv.length
                    ? "Definir inventario"
                    : `Inventario seleccionado (${thousandsSystem(inv.length)})`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <Controller
                name="highlight"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.row, { marginTop: 12 }]}>
                    <StyledText>Destacar localidad</StyledText>
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
            placeholder="Creá una buena descripción para tu tienda"
            visible={descriptionModal}
            defaultValue={value}
            maxLength={3000}
            onClose={() => setDescriptionModal(false)}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="inventories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            data={data}
            multiple={value}
            title="INVENTARIOS"
            remove="Remover"
            noData="NO HAY INVENTARIOS"
            visible={inventoryModal}
            onClose={() => setInventoryModal(false)}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default CreateLocation;
