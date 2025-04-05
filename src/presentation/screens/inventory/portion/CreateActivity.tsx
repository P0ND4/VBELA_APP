import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { thousandsSystem } from "shared/utils";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { add as addMovement } from "application/slice/inventories/movements.slice";
import { edit as editPortion } from "application/slice/inventories/portions.slice";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Movement, Portion } from "domain/entities/data/inventories";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { Type as TypeMovement } from "domain/enums/data/inventory/movement.enums";
import { Type as TypePortion } from "domain/enums/data/inventory/portion.enums";
import apiClient, { endpoints } from "infrastructure/api/server";
import { batch } from "react-redux";
import { extractMovementsFromPortion } from "presentation/screens/common/sales/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import StyledText from "presentation/components/text/StyledText";

type PickerFloorModalData = { label: string; value: string }[];

type CreateEntryProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateActivity">;
};

export const calculateQuantity = (movements: Movement[], stockID: string) => {
  const found = movements.filter((movement) => movement.stock.id === stockID);
  return found.reduce((acc, movement) => acc + movement.quantity, 0);
};

type FormProps = {
  portion: Portion | null;
  quantity: number;
};

const CreateActivity: React.FC<CreateEntryProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);
  const inventories = useAppSelector((state) => state.inventories);
  const portions = useAppSelector((state) => state.portions);

  const stocksMap = new Map(stocks.map((s) => [s.id, s]));

  const inventoryID = route.params.inventoryID;
  const type = route.params.type;

  const { control, handleSubmit, watch, formState } = useForm<FormProps>({
    defaultValues: {
      portion: null,
      quantity: 0,
    },
  });

  const [portionModal, setPortionModal] = useState<boolean>(false);
  const [quantityModal, setQuantityModal] = useState<boolean>(false);

  const [stockData, setStockData] = useState<PickerFloorModalData>([]);

  const { portion, quantity } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const found = portions.filter((s) => s.inventoryID === inventoryID);
    const data = found.map((s) => ({ label: s.name, value: s.id }));
    setStockData(data);
  }, [portions, inventoryID]);

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${type === TypePortion.Entry ? "entrada" : "salida"}` });
  }, [type]);

  const isRequired = (value: unknown) => Boolean(value);

  const save = async ({ quantity, portion }: FormProps) => {
    const movements =
      type === TypePortion.Entry
        ? extractMovementsFromPortion(portion!, quantity, stocksMap, inventories)
        : [];
    const portionUpdated = { ...portion!, quantity: portion!.quantity + quantity };
    batch(() => {
      movements.forEach((movement) => dispatch(addMovement(movement)));
      dispatch(editPortion(portionUpdated));
    });

    navigation.pop();
    await apiClient({
      url: endpoints.portion.postActivity(),
      method: "POST",
      data: {
        portion: portionUpdated,
        movements,
      },
    });
  };

  return (
    <>
      <Layout>
        <View style={{ flex: 1 }}>
          <View>
            <StyledButton style={styles.row} onPress={() => setPortionModal(true)}>
              <StyledText>{portion ? portion.name : "Porción"}</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton>
            {formState.errors.portion && (
              <StyledText color={colors.primary} verySmall>
                El Stock es requerido
              </StyledText>
            )}
            <StyledButton
              style={styles.row}
              onPress={() => setQuantityModal(true)}
              disable={!portion}
            >
              <StyledText>Cantidad {!!quantity && `(${thousandsSystem(quantity)})`}</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton>
            {formState.errors.quantity && (
              <StyledText color={colors.primary} verySmall>
                La cantidad es requerida
              </StyledText>
            )}
          </View>
        </View>
        <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(save)}>
          <StyledText color="#FFFFFF" center>
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="portion"
        rules={{ validate: isRequired }}
        control={control}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE LA PORCIÓN"
            remove="Remover porción"
            visible={portionModal}
            onClose={() => setPortionModal(false)}
            data={stockData}
            onSubmit={(stockID) => {
              const portion = portions.find((s) => s.id === stockID);
              onChange(portion || null);
            }}
          />
        )}
      />
      <Controller
        name="quantity"
        control={control}
        rules={{ validate: isRequired }}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Cantidad"
            negativeNumber={type === TypeMovement.Output}
            description={() =>
              `Defina la cantidad de ${type === TypePortion.Entry ? "entrada" : "salida"}`
            }
            visible={quantityModal}
            defaultValue={value}
            isRemove={!!value}
            maxValue={999999}
            onClose={() => setQuantityModal(false)}
            onSave={onChange}
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

export default CreateActivity;
