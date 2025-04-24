import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { RootSetting, SettingRouteProp } from "domain/entities/navigation/root.setting.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch } from "application/store/hook";
import { random } from "shared/utils";
import { add, edit, remove } from "application/slice/settings/payment.methods.slice";
import { PaymentMethods } from "domain/entities/data/settings";
import apiClient, { endpoints } from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import ScreenModal from "presentation/components/modal/ScreenModal";

type IconNamesType = keyof typeof Ionicons.glyphMap;

const Icon: React.FC<{ name: IconNamesType; onPress?: () => void }> = ({ name, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.icon, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={name} size={34} color={colors.text} />
    </TouchableOpacity>
  );
};

type CreatePaymentMethodProps = {
  navigation: StackNavigationProp<RootSetting>;
  route: SettingRouteProp<"CreatePaymentMethod">;
};

const CreatePaymentMethod: React.FC<CreatePaymentMethodProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const defaultValue = route.params?.defaultValue;

  const { control, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      name: defaultValue?.name || "",
      icon: defaultValue?.icon || "image-outline",
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const icons: IconNamesType[] = [
    "image-outline",
    "apps-outline",
    "basket-outline",
    "cash-outline",
    "compass-outline",
    "cube-outline",
    "egg-outline",
    "grid-outline",
    "mail-outline",
    "pie-chart-outline",
    "ribbon-outline",
    "star-outline",
    "sunny-outline",
    "timer-outline",
    "wallet-outline",
    "watch-outline",
    "card-outline",
    "archive-outline",
    "barcode-outline",
    "briefcase-outline",
    "logo-bitcoin",
    "logo-usd",
    "trophy-outline",
    "diamond-outline",
    "sparkles-outline",
    "logo-euro",
    "logo-yen",
    "logo-vercel",
    "logo-paypal",
    "bag-outline",
    "aperture-outline",
  ];

  const icon = watch("icon");

  const removeItem = async (id: string) => {
    dispatch(remove({ id }));
    navigation.pop();
    await apiClient({
      url: endpoints.setting.paymentMethods.delete(id),
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

  const save = async (data: PaymentMethods) => {
    dispatch(add(data));
    await apiClient({
      url: endpoints.setting.paymentMethods.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: PaymentMethods) => {
    dispatch(edit(data));
    await apiClient({
      url: endpoints.setting.paymentMethods.put(data.id),
      method: "PUT",
      data,
    });
  };

  return (
    <Layout>
      <View style={{ flexGrow: 1 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Icon name={icon} onPress={() => setVisible(true)} />
        </View>
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
        <ScreenModal
          title="Selección de iconos"
          visible={visible}
          onClose={() => setVisible(false)}
        >
          <Layout>
            <FlatList
              data={icons}
              numColumns={4}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Icon
                  name={item}
                  onPress={() => {
                    setValue("icon", item);
                    setVisible(false);
                  }}
                />
              )}
            />
          </Layout>
        </ScreenModal>
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
  );
};

const styles = StyleSheet.create({
  icon: {
    margin: 4,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
});

export default CreatePaymentMethod;
