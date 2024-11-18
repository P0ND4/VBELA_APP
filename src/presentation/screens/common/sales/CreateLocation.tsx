import React, { useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@react-navigation/native";
import { Location } from "domain/entities/data/common";
import { random, thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputScreenModal from "presentation/components/modal/InputScreenModal";

type CreateLocationProps = {
  defaultValue?: Location;
  onSave: (data: Location[]) => void;
  onUpdate: (data: Location) => void;
};

const CreateLocation: React.FC<CreateLocationProps> = ({ onSave, onUpdate, defaultValue }) => {
  const { control, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      description: defaultValue?.description || "",
      highlight: defaultValue?.highlight || false,
      inventories: defaultValue?.inventories || [],
      creationDate: defaultValue?.creationDate || new Date().toISOString(),
      modificationDate: new Date().toISOString(),
    },
  });

  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<string>("");

  const description = watch("description");

  const save = (data: Location) => {
    const multiple = Array.from({ length: parseInt(repeat, 10) || 1 }, (_, index) => ({
      ...data,
      id: random(10),
      name: `${data.name.slice(0, 25)}${index ? ` (${index})` : ""}`,
    }));
    onSave(multiple);
  };

  const handleSaveOrUpdate = (data: Location) => (defaultValue ? onUpdate(data) : save(data));

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View>
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
              <StyledButton style={styles.row}>
                <StyledText>Definir inventario</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              {!defaultValue && (
                <StyledInput
                  placeholder="Repetir mesa"
                  maxLength={2}
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    const numeric = num.replace(/[^0-9]/g, "");
                    setRepeat(numeric);
                  }}
                  value={repeat}
                />
              )}
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
      <InputScreenModal
        title="Descripción"
        placeholder="Creá una buena descripción para tu tienda"
        visible={descriptionModal}
        defaultValue={description}
        maxLength={3000}
        onClose={() => setDescriptionModal(false)}
        onSubmit={(value) => setValue("description", value)}
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
