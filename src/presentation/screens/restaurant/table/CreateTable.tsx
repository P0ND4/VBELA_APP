import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { StackNavigationProp } from "@react-navigation/stack";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { random, thousandsSystem } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { addMultiple, edit } from "application/slice/restaurants/tables.slice";
import { Table } from "domain/entities/data/restaurants";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputScreenModal from "presentation/components/modal/InputScreenModal";

type CreateTableProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateTable">;
};

const CreateTable: React.FC<CreateTableProps> = ({ navigation, route }) => {
  const defaultValue = route.params.defaultValue;
  const restaurantID = route.params.restaurantID;

  const { control, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      restaurantID,
      name: defaultValue?.name || "",
      description: defaultValue?.description || "",
      highlight: defaultValue?.highlight || false,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const restaurants = useAppSelector((state) => state.restaurants);

  const { colors } = useTheme();

  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<string>("");

  const description = watch("description");

  const dispatch = useAppDispatch();

  useEffect(() => {
    const restaurant = restaurants.find((r) => r.id === restaurantID);
    navigation.setOptions({
      title: `${defaultValue ? "Editar" : "Crear"} Mesa: ${restaurant?.name}`,
    });
  }, [restaurants]);

  const save = (data: Table) => {
    const multiple = Array.from({ length: parseInt(repeat, 10) || 1 }, (_, index) => ({
      ...data,
      id: random(10),
      name: `${data.name.slice(0, 25)}${index ? ` (${index})` : ""}`,
    }));
    dispatch(addMultiple(multiple));
    navigation.pop();
  };

  const update = (data: Table) => {
    dispatch(edit(data));
    navigation.pop();
  };

  const handleSaveOrUpdate = (data: any) => {
    const changed = { ...data, capacity: parseInt(data.capacity, 10) };
    defaultValue ? update(changed) : save(changed);
  };

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
                    <StyledText>Destacar mesa</StyledText>
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
        placeholder="Creá una buena descripción para tu mesa"
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

export default CreateTable;
