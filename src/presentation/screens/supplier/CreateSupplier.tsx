import React, { useState } from "react";
import { StyleSheet, View, Switch } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import { random, thousandsSystem } from "shared/utils";
import { useAppDispatch } from "application/store/hook";
import { RootSupplier, SupplierRouteProp } from "domain/entities/navigation/root.supplier.entity";
import { Supplier } from "domain/entities/data";
import apiClient, { endpoints } from "infrastructure/api/server";
import { add, edit } from "application/slice/suppliers/suppliers.slice";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputScreenModal from "presentation/components/modal/InputScreenModal";

type CreateSupplierProps = {
  navigation: StackNavigationProp<RootSupplier>;
  route: SupplierRouteProp<"CreateSupplier">;
};

const CreateSupplier: React.FC<CreateSupplierProps> = ({ navigation, route }) => {
  const defaultValue = route.params?.supplier;

  const { control, handleSubmit, watch, formState } = useForm<Supplier>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      identification: defaultValue?.identification || "",
      description: defaultValue?.description || "",
      highlight: defaultValue?.highlight || false,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(false);
  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);

  const { description } = watch();

  const dispatch = useAppDispatch();

  const save = async (data: Supplier) => {
    setLoading(true);
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.supplier.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Supplier) => {
    setLoading(true);
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.supplier.put(data.id),
      method: "PUT",
      data,
    });
  };

  const handleSaveOrUpdate = (data: Supplier) => (defaultValue ? update(data) : save(data));

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
                placeholder="Nombre del proveedor"
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
              <Controller
                name="identification"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="Identificación"
                    maxLength={30}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <StyledButton style={styles.row} onPress={() => setDescriptionModal(true)}>
                <StyledText>
                  {description
                    ? `Descripción agregada (${thousandsSystem(description.length)} letras)`
                    : "Descripción"}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <Controller
                name="highlight"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.row, { marginTop: 12 }]}>
                    <StyledText>Destacar proveedor</StyledText>
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
        <StyledButton
          loading={loading}
          backgroundColor={colors.primary}
          onPress={handleSubmit(handleSaveOrUpdate)}
        >
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
            placeholder="Creá una buena descripción para tu proveedor"
            visible={descriptionModal}
            defaultValue={value}
            maxLength={3000}
            onClose={() => setDescriptionModal(false)}
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

export default CreateSupplier;
