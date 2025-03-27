import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { changeDate, random, thousandsSystem } from "shared/utils";
import { useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  add as addMovement,
  edit as editMovement,
} from "application/slice/inventories/movements.slice";
import { edit as editStock } from "application/slice/inventories/stocks.slice";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Movement } from "domain/entities/data/inventories";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { Type as TypeMovement } from "domain/enums/data/inventory/movement.enums";
import apiClient, { endpoints } from "infrastructure/api/server";
import { batch } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import SimpleCalendarModal from "presentation/components/modal/SimpleCalendarModal";
import StyledText from "presentation/components/text/StyledText";

type CreateEntryProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateMovement">;
};

type PickerFloorModalData = { label: string; value: string }[];

export const calculateQuantity = (movements: Movement[], stockID: string) => {
  const found = movements.filter((movement) => movement.stock.id === stockID);
  return found.reduce((acc, movement) => acc + movement.quantity, 0);
};

const CreateMovement: React.FC<CreateEntryProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  const inventories = useAppSelector((state) => state.inventories);
  const suppliers = useAppSelector((state) => state.suppliers);
  const stocks = useAppSelector((state) => state.stocks);

  const [supplierData, setSupplierData] = useState<PickerFloorModalData>([]);
  const [stockData, setStockData] = useState<PickerFloorModalData>([]);

  const [supplierValueModal, setSupplierValueModal] = useState<boolean>(false);
  const [supplierModal, setSupplierModal] = useState<boolean>(false);
  const [stockModal, setStockModal] = useState<boolean>(false);
  const [calendarModal, setCalendarModal] = useState<boolean>(false);
  const [quantityModal, setQuantityModal] = useState<boolean>(false);
  const [valueModal, setValueModal] = useState<boolean>(false);
  const [optional, setOptional] = useState<boolean>(false);

  const defaultValue = route.params?.movement;
  const inventoryID = route.params.inventoryID;
  const type = route.params.type;

  const { control, handleSubmit, setValue, watch, formState } = useForm<Movement>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      type,
      inventory: defaultValue?.inventory || undefined,
      stock: defaultValue?.stock || undefined,
      supplier: defaultValue?.supplier || null,
      supplierValue: defaultValue?.supplierValue || 0,
      quantity: defaultValue?.quantity || 0,
      currentValue: defaultValue?.currentValue || 0,
      date: defaultValue?.date || new Date().getTime(),
      paymentMethod: defaultValue?.paymentMethod || "",
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { supplier, supplierValue, stock, quantity, currentValue, date } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const data = suppliers.map((s) => ({ label: s.name, value: s.id }));
    setSupplierData(data);
  }, [suppliers]);

  useEffect(() => {
    const found = stocks.filter((s) => s.inventoryID === inventoryID);
    const data = found.map((s) => ({ label: `${s.name} ${s.unit && `(${s.unit})`}`, value: s.id }));
    setStockData(data);
  }, [stocks, inventoryID]);

  useEffect(() => {
    if (!defaultValue) {
      const foundInventory = inventories.find((i) => i.id === inventoryID);
      if (!foundInventory) return navigation.pop();
      setValue("inventory", { id: inventoryID, name: foundInventory.name });
    }
  }, [defaultValue, inventoryID, inventories]);

  useEffect(() => {
    if (stock && !defaultValue) {
      const foundStock = stocks.find((s) => s.id === stock.id);
      setValue("currentValue", foundStock?.currentValue ?? 0);
    }
  }, [stock, stocks, defaultValue]);

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${type === TypeMovement.Entry ? "entrada" : "salida"}` });
  }, [type]);

  const isRequired = (value: unknown) => Boolean(value);

  const save = async (data: Movement) => {
    const stockSelected = stocks.find((stock) => stock.id === data.stock.id)!;
    batch(() => {
      dispatch(editStock({ ...stockSelected, currentValue: data.currentValue }));
      dispatch(addMovement(data));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.movement.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Movement) => {
    dispatch(editMovement(data));
    navigation.pop();
    await apiClient({
      url: endpoints.movement.put(data.id),
      method: "PUT",
      data,
    });
  };

  const handleSaveOrUpdate = async (data: Movement) => {
    const action = defaultValue ? update : save;
    await action(data);
  };

  return (
    <>
      <Layout>
        <View style={{ flex: 1 }}>
          {stock && type === TypeMovement.Entry && (
            <StyledText center style={{ marginBottom: 15 }}>
              Valor anterior:{" "}
              <StyledText color={colors.primary}>{thousandsSystem(stock.currentValue)}</StyledText>
            </StyledText>
          )}
          <View>
            {!defaultValue && (
              <>
                <StyledButton style={styles.row} onPress={() => setStockModal(true)}>
                  <StyledText>
                    {stock ? `${stock.name} ${stock.unit && `(${stock.unit})`}` : "Stock"}
                  </StyledText>
                  <Ionicons name="chevron-forward" color={colors.text} size={19} />
                </StyledButton>
                {formState.errors.stock && (
                  <StyledText color={colors.primary} verySmall>
                    El Stock es requerido
                  </StyledText>
                )}
              </>
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
            {type === TypeMovement.Entry && (
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
            {supplier && (
              <>
                <StyledButton style={styles.row} onPress={() => setSupplierValueModal(true)}>
                  <StyledText>
                    Valor de {type.toLowerCase()}{" "}
                    {!!supplierValue && `(${thousandsSystem(supplierValue)})`}
                  </StyledText>
                  <Ionicons name="chevron-forward" color={colors.text} size={19} />
                </StyledButton>
                {formState.errors.supplierValue && (
                  <StyledText color={colors.primary} verySmall>
                    El valor de {type.toLowerCase()} del proveedor es requerida
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
            <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
              <StyledText>Opcionales</StyledText>
              <Ionicons name={optional ? "caret-up" : "caret-down"} color={colors.text} />
            </StyledButton>
            {optional && (
              <>
                <StyledButton style={styles.row} onPress={() => setSupplierModal(true)}>
                  <StyledText>{supplier ? supplier.name : "Proveedor"}</StyledText>
                  <Ionicons name="chevron-forward" color={colors.text} size={19} />
                </StyledButton>
              </>
            )}
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
      {!defaultValue && (
        <Controller
          name="stock"
          rules={{ validate: isRequired }}
          control={control}
          render={({ field: { onChange } }) => (
            <PickerFloorModal
              title="SELECCIONE EL STOCK"
              remove="Remover stock"
              visible={stockModal}
              onClose={() => setStockModal(false)}
              data={stockData}
              onSubmit={(stockID) => {
                const stock = stocks.find((s) => s.id === stockID);
                onChange(
                  stock
                    ? {
                        id: stock.id,
                        name: stock.name,
                        unit: stock.unit,
                        currentValue: stock.currentValue,
                      }
                    : null,
                );
              }}
            />
          )}
        />
      )}
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
            negativeNumber={type === TypeMovement.Output}
            description={() =>
              `Defina la cantidad de ${type === TypeMovement.Entry ? "entrada" : "salida"}`
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
      {type === TypeMovement.Entry && (
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
      <Controller
        name="supplier"
        control={control}
        render={({ field: { onChange } }) => (
          <PickerFloorModal
            title="SELECCIONE EL PROVEEDOR"
            remove="Remover proveedor"
            visible={supplierModal}
            onClose={() => setSupplierModal(false)}
            data={supplierData}
            onSubmit={(supplierID) => {
              const supplier = suppliers.find((s) => s.id === supplierID);
              onChange(supplier ? { id: supplier.id, name: supplier.name } : null);
              if (!supplier) setValue("supplierValue", 0);
            }}
          />
        )}
      />
      {supplier && (
        <Controller
          name="supplierValue"
          control={control}
          rules={{ validate: isRequired }}
          render={({ field: { onChange, value } }) => (
            <CountScreenModal
              title={`Valor del ${type === TypeMovement.Entry ? "ingreso" : "egreso"}`}
              description={() => "Defina el valor por el proveedor asociado"}
              visible={supplierValueModal}
              defaultValue={value}
              isRemove={!!value}
              maxValue={9999999999}
              onClose={() => setSupplierValueModal(false)}
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
