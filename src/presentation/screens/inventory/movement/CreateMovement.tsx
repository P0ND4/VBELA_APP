import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { changeDate, random, thousandsSystem } from "shared/utils";
import { useTheme } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Controller, useForm } from "react-hook-form";
import { Movement, Stock } from "domain/entities/data/inventories";
import { addMovement, editMovement } from "application/slice/inventories/stocks.slice";
import { Type } from "domain/enums/data/inventory/movement.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import SimpleCalendarModal from "presentation/components/modal/SimpleCalendarModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import CountScreenModal from "presentation/components/modal/CountScreenModal";

type CreateEntryProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateMovement">;
};

const CreateMovement: React.FC<CreateEntryProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);

  const [data, setData] = useState<{ label: string; value: string }[]>([]);
  const [stock, setStock] = useState<Stock>();

  const [stockModal, setStockModal] = useState<boolean>(false);
  const [calendarModal, setCalendarModal] = useState<boolean>(false);
  const [quantityModal, setQuantityModal] = useState<boolean>(false);
  const [valueModal, setValueModal] = useState<boolean>(false);

  const defaultValue = route.params?.movement;
  const inventoryID = route.params.inventoryID;
  const type = route.params.type;

  const { control, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      type,
      inventoryID,
      supplierID: defaultValue?.supplierID || "",
      stockID: defaultValue?.stockID || "",
      quantity: defaultValue?.quantity || 0,
      currentValue: defaultValue?.currentValue || 0,
      date: defaultValue?.date || null,
      paymentMethod: defaultValue?.paymentMethod || "",
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { stockID, quantity, currentValue, date } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const found = stocks.filter((s) => s.inventoryID === inventoryID);
    const data = found.map((s) => ({ label: `${s.name} ${s.unit && `(${s.unit})`}`, value: s.id }));
    setData(data);
  }, [stocks, inventoryID]);

  useEffect(() => {
    const foundStock = stocks.find((s) => s.id === stockID);
    setValue("currentValue", foundStock?.currentValue ?? 0);
    setStock(foundStock);
  }, [stockID, stocks]);

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${type === Type.Entry ? "entrada" : "salida"}` });
  }, [type]);

  const isRequired = (value: any) => !!value;

  const save = (data: Movement) => {
    dispatch(addMovement([data]));
    navigation.pop();
  };

  const update = (data: Movement) => {
    dispatch(editMovement([data]));
    navigation.pop();
  };

  const handleSaveOrUpdate = (data: Movement) => (defaultValue ? update(data) : save(data));

  return (
    <>
      <Layout>
        <View style={{ flex: 1 }}>
          {stock && type === Type.Entry && (
            <StyledText center style={{ marginBottom: 15 }}>
              Valor anterior:{" "}
              <StyledText color={colors.primary}>{thousandsSystem(stock.currentValue)}</StyledText>
            </StyledText>
          )}
          <View>
            <StyledButton style={styles.row} onPress={() => setStockModal(true)}>
              <StyledText>
                {stock ? `${stock.name} ${stock.unit && `(${stock.unit})`}` : "Stock"}
              </StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton>
            {formState.errors.stockID && (
              <StyledText color={colors.primary} verySmall>
                El Stock es requerido
              </StyledText>
            )}
            <StyledButton style={styles.row} onPress={() => setQuantityModal(true)}>
              <StyledText>Cantidad {!!quantity && `(${thousandsSystem(quantity)})`}</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton>
            {formState.errors.quantity && (
              <StyledText color={colors.primary} verySmall>
                La cantidad es requerida
              </StyledText>
            )}
            {type === Type.Entry && (
              <>
                <StyledButton style={styles.row} onPress={() => setValueModal(true)}>
                  <StyledText>
                    Precio por unidad {!!currentValue && `(${thousandsSystem(currentValue)})`}
                  </StyledText>
                  <Ionicons name="chevron-forward" color={colors.text} size={19} />
                </StyledButton>
                {formState.errors.currentValue && (
                  <StyledText color={colors.primary} verySmall>
                    El precio por unidad es requerida
                  </StyledText>
                )}
              </>
            )}
            <StyledButton style={styles.row} onPress={() => setCalendarModal(true)}>
              <StyledText>Fecha de entrada {date && `(${changeDate(new Date(date))})`}</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton>
            {formState.errors.date && (
              <StyledText color={colors.primary} verySmall>
                La fecha de entrada es requerida
              </StyledText>
            )}
            {/* <StyledButton style={styles.row} onPress={() => {}}>
              <StyledText>Proveedor</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton> */}
            {/* <StyledButton style={styles.row} onPress={() => {}}>
              <StyledText>Método de pago</StyledText>
              <Ionicons name="chevron-forward" color={colors.text} size={19} />
            </StyledButton> */}
          </View>
        </View>
        <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(handleSaveOrUpdate)}>
          <StyledText color="#FFFFFF" center>
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="stockID"
        rules={{ validate: isRequired }}
        control={control}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE EL STOCK"
            remove="Remover stock"
            visible={stockModal}
            onClose={() => setStockModal(false)}
            data={data}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="date"
        rules={{ validate: isRequired }}
        control={control}
        render={({ field: { onChange, value } }) => (
          <SimpleCalendarModal
            defaultValue={value}
            visible={calendarModal}
            onClose={() => setCalendarModal(false)}
            onSave={onChange}
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
            negativeNumber={type === Type.Output}
            description={() => "Defina la cantidad de entrada"}
            visible={quantityModal}
            defaultValue={value}
            isRemove={!!value}
            maxValue={999999}
            onClose={() => setQuantityModal(false)}
            onSave={onChange}
          />
        )}
      />
      {type === Type.Entry && (
        <Controller
          name="currentValue"
          control={control}
          rules={{ validate: isRequired }}
          render={({ field: { onChange, value } }) => (
            <CountScreenModal
              title="Precio por unidad"
              description={() => "Defina el precio del producto"}
              visible={valueModal}
              defaultValue={value}
              isRemove={!!value}
              maxValue={9999999999}
              onClose={() => setValueModal(false)}
              onSave={onChange}
            />
          )}
        />
      )}
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

export default CreateMovement;
