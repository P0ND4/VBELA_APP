import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import {
  CollaboratorRouteProp,
  RootCollaborator,
} from "domain/entities/navigation/root.collaborator.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { random } from "shared/utils";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@react-navigation/native";
import { Collaborator } from "domain/entities/data/collaborators";
import { EMAIL_EXPRESSION } from "shared/constants/expressions";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";

type CreateCollaboratorProps = {
  navigation: StackNavigationProp<RootCollaborator>;
  route: CollaboratorRouteProp<"CreateCollaborator">;
};

type PermissionKeys = keyof Omit<Collaborator, "id">;

const CreateCollaborator: React.FC<CreateCollaboratorProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const defaultValue = route.params?.collaborator;

  const { control, handleSubmit, formState, watch, setValue } = useForm<Collaborator>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      lastName: defaultValue?.lastName || "",
      email: defaultValue?.email || "",
      admin: defaultValue?.admin || false,
      accessToStatistics: defaultValue?.accessToStatistics || false,
      accessToStore: defaultValue?.accessToStore || false,
      accessToRestaurant: defaultValue?.accessToRestaurant || false,
      accessToKitchen: defaultValue?.accessToKitchen || false,
      accessToInventory: defaultValue?.accessToInventory || false,
    },
  });

  const PERMISSIONS: { name: PermissionKeys; label: string }[] = useMemo(() => {
    return [
      { name: "admin", label: "Administrador" },
      { name: "accessToStatistics", label: "Acceso a estadística" },
      { name: "accessToStore", label: "Acceso a tienda" },
      { name: "accessToRestaurant", label: "Acceso a restaurante" },
      { name: "accessToKitchen", label: "Acceso a cocina" },
      { name: "accessToInventory", label: "Acceso a inventario" },
    ];
  }, []);

  const [optional, setOptional] = useState<boolean>(false);
  const [permissModal, setPermissModal] = useState<boolean>(false);
  const [errorPermiss, setErrorPermiss] = useState<string | null>(null);

  const { admin } = watch();

  const VALID_PERMISSIONS = useMemo(
    () => PERMISSIONS.filter((permission) => watch()[permission.name]),
    [watch()],
  );

  useEffect(() => {
    navigation.setOptions({
      title: "Crear Colaborador",
    });
  }, []);

  useEffect(() => {
    if (admin) {
      setValue("accessToStatistics", admin);
      setValue("accessToInventory", admin);
      setValue("accessToKitchen", admin);
      setValue("accessToRestaurant", admin);
      setValue("accessToStore", admin);
    }
  }, [admin]);

  const update = (data: Collaborator) => {};

  const save = (data: Collaborator) => {};

  const handleSaveOrUpdate = (data: Collaborator) => {
    if (!VALID_PERMISSIONS.length) {
      setErrorPermiss("Debe haber al menos un permiso activado");
      return;
    }

    setErrorPermiss(null);
    if (defaultValue) update(data);
    else save(data);
  };

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
            name="email"
            control={control}
            rules={{
              required: true,
              pattern: {
                value: EMAIL_EXPRESSION,
                message: "Correo inválido",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                keyboardType="email-address"
                maxLength={64}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Correo electrónico"
              />
            )}
          />
          {formState.errors.email && (
            <StyledText color={colors.primary} verySmall>
              El correo electrónico es requerido
            </StyledText>
          )}
          <StyledButton style={styles.row} onPress={() => setPermissModal(true)}>
            <StyledText>
              {!VALID_PERMISSIONS.length
                ? "Asignar permisos"
                : `Hay ${VALID_PERMISSIONS.length} permisos asignados`}
            </StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          {errorPermiss && (
            <StyledText color={colors.primary} verySmall>
              {errorPermiss}
            </StyledText>
          )}
          <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
            <StyledText>Opcionales</StyledText>
            <Ionicons name={optional ? "caret-up" : "caret-down"} />
          </StyledButton>
          {optional && (
            <>
              <Controller
                name="lastName"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="Apellido"
                    maxLength={30}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
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
      <ScreenModal title="Permisos" visible={permissModal} onClose={() => setPermissModal(false)}>
        <Layout style={{ padding: 0 }}>
          {PERMISSIONS.map((permission) => (
            <Controller
              key={permission.name}
              name={permission.name}
              control={control}
              render={({ field: { onChange, value } }) => (
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <StyledText style={{ marginTop: 8 }}>{permission.label}</StyledText>
                  <Switch
                    value={value as boolean}
                    onValueChange={onChange}
                    disabled={admin && permission.name !== "admin"}
                    thumbColor={value ? colors.primary : colors.card}
                  />
                </View>
              )}
            />
          ))}
        </Layout>
      </ScreenModal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CreateCollaborator;
