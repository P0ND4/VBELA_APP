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
import { Collaborator, Permissions } from "domain/entities/data/collaborators";
import { EMAIL_EXPRESSION } from "shared/constants/expressions";
import { useAppSelector, useAppDispatch } from "application/store/hook";
import { add, edit } from "application/slice/collaborators/collaborators.slice";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import apiClient from "infrastructure/api/server";
import endpoints from "config/constants/api.endpoints";

type CreateCollaboratorProps = {
  navigation: StackNavigationProp<RootCollaborator>;
  route: CollaboratorRouteProp<"CreateCollaborator">;
};

type PermissionKeys = keyof Permissions;

const CreateCollaborator: React.FC<CreateCollaboratorProps> = ({ navigation, route }) => {
  const { emit, socket, connect } = useWebSocketContext();

  const { identifier } = useAppSelector((state) => state.user);
  const collaborators = useAppSelector((state) => state.collaborators);

  const { colors } = useTheme();

  const defaultValue = route.params?.collaborator;

  const { control, handleSubmit, formState, watch, setValue } = useForm<Collaborator>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      identifier: defaultValue?.identifier || "",
      lastName: defaultValue?.lastName || "",
      permissions: {
        admin: defaultValue?.permissions?.admin || false,
        accessToStatistics: defaultValue?.permissions?.accessToStatistics || false,
        accessToStore: defaultValue?.permissions?.accessToStore || false,
        accessToRestaurant: defaultValue?.permissions?.accessToRestaurant || false,
        accessToKitchen: defaultValue?.permissions?.accessToKitchen || false,
        accessToEconomy: defaultValue?.permissions?.accessToEconomy || false,
        accessToSupplier: defaultValue?.permissions?.accessToSupplier || false,
        accessToCollaborator: defaultValue?.permissions?.accessToCollaborator || false,
        accessToInventory: defaultValue?.permissions?.accessToInventory || false,
      },
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const PERMISSIONS: { name: PermissionKeys; label: string }[] = useMemo(() => {
    return [
      { name: "admin", label: "Administrador" },
      { name: "accessToStatistics", label: "Acceso a estadística" },
      { name: "accessToStore", label: "Acceso a tienda" },
      { name: "accessToRestaurant", label: "Acceso a restaurante" },
      { name: "accessToKitchen", label: "Acceso a cocina" },
      { name: "accessToEconomy", label: "Acceso a ingreso/egreso" },
      { name: "accessToSupplier", label: "Acceso a proveedor" },
      { name: "accessToCollaborator", label: "Acceso a colaborador" },
      { name: "accessToInventory", label: "Acceso a inventario" },
    ];
  }, []);

  const [optional, setOptional] = useState<boolean>(false);
  const [permissModal, setPermissModal] = useState<boolean>(false);
  const [errorPermiss, setErrorPermiss] = useState<string | null>(null);

  const { permissions } = watch();

  const dispatch = useAppDispatch();

  const VALID_PERMISSIONS = useMemo(
    () => PERMISSIONS.filter((permission) => permissions?.[permission.name]),
    [JSON.stringify(permissions)],
  );
  useEffect(() => {
    navigation.setOptions({
      title: "Crear Colaborador",
    });
  }, []);

  useEffect(() => {
    if (permissions?.admin) {
      setValue("permissions.accessToStatistics", true);
      setValue("permissions.accessToInventory", true);
      setValue("permissions.accessToKitchen", true);
      setValue("permissions.accessToRestaurant", true);
      setValue("permissions.accessToStore", true);
      setValue("permissions.accessToCollaborator", true);
      setValue("permissions.accessToSupplier", true);
      setValue("permissions.accessToEconomy", true);
    }
  }, [permissions?.admin]);

  const save = async (data: Collaborator) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.collaborator.post(),
      method: "POST",
      data,
    });
    emit("accessToCollaborator");
    await connect();
  };

  const update = async (data: Collaborator) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.collaborator.put(data.id),
      method: "PUT",
      data,
    });
    emit("accessToCollaborator");
    if (defaultValue?.identifier)
      socket?.emit("account-updated", { identifier: defaultValue?.identifier });
  };

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
            name="identifier"
            control={control}
            rules={{
              required: true,
              pattern: {
                value: EMAIL_EXPRESSION,
                message: "Correo inválido",
              },
              validate: (ident) => {
                const collaboratorsToCheck = defaultValue
                  ? collaborators.filter((c) => c.id !== defaultValue.id)
                  : collaborators;

                if (!collaboratorsToCheck.some((c) => c.identifier === ident)) return true;
                if (ident !== identifier) return true;

                return `El correo electrónico ${ident === identifier ? "no puede ser el mismo que tu cuenta" : "ya está registrado"}`;
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
          {formState.errors.identifier && (
            <StyledText color={colors.primary} verySmall>
              {formState.errors.identifier.message || "El correo electrónico es requerido"}
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
              name={`permissions.${permission.name}`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <StyledText style={{ marginTop: 8 }}>{permission.label}</StyledText>
                  <Switch
                    value={value as boolean}
                    onValueChange={onChange}
                    disabled={permissions?.admin && permission.name !== "admin"}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CreateCollaborator;
