import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Switch, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Ingredients, Inventory, Recipe, Stock } from "domain/entities/data/inventories";
import { add, edit } from "application/slice/inventories/recipes.slice";
import { useTheme } from "@react-navigation/native";
import { random, thousandsSystem } from "shared/utils";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import apiClient, { endpoints } from "infrastructure/api/server";

const GET_TAB_NAME = {
  [Visible.Both]: "RECETAS/PAQUETES",
  [Visible.Restaurant]: "RECETAS",
  [Visible.Store]: "PAQUETES",
  [Visible.None]: "",
};

type onChage = { id: string; quantity: number };

type CardProps = {
  defaultValue: number;
  stock: Stock;
  onChange: (props: onChage) => void;
};

const Card: React.FC<CardProps> = ({ defaultValue, stock, onChange }) => {
  const { colors } = useTheme();

  const [quantity, setQuantity] = useState<number>(defaultValue);
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <StyledButton style={styles.row} onPress={() => setVisible(true)}>
        <StyledText>
          {stock.name} {stock.unit && `(${stock.unit})`}
        </StyledText>
        <StyledText color={colors.primary}>{thousandsSystem(quantity)}</StyledText>
      </StyledButton>
      <CountScreenModal
        title="Cantidad"
        defaultValue={quantity}
        description={(quantity) =>
          quantity
            ? `Agregar ${thousandsSystem(quantity)} ${stock.unit && `(${stock.unit})`}`
            : "Agrega la cantidad a utilizar"
        }
        isRemove={!!quantity}
        visible={visible}
        maxValue={999999}
        onClose={() => setVisible(false)}
        onSave={(quantity) => {
          onChange({ id: stock.id, quantity });
          setQuantity(quantity);
        }}
      />
    </>
  );
};

type IngredientsScreenProps = {
  defaultValue: Ingredients[];
  inventory: Inventory;
  visible: boolean;
  onClose: () => void;
  onSave: (ingredients: Ingredients[]) => void;
};

const IngredientsScreen: React.FC<IngredientsScreenProps> = ({
  defaultValue,
  inventory,
  visible,
  onClose,
  onSave,
}) => {
  const stocks = useAppSelector((state) => state.stocks);

  const { colors } = useTheme();

  const [data, setData] = useState<Stock[]>([]);
  const [ingredients, setIngredients] = useState<Ingredients[]>(defaultValue);

  useEffect(() => {
    const found = stocks.filter((s) => s.inventoryID === inventory.id && s.visible);
    setData(found);
  }, [stocks]);

  const onChange = ({ id, quantity }: onChage) => {
    const found = ingredients.find((i) => i.id === id);

    const changed = found
      ? quantity === 0
        ? ingredients.filter((i) => i.id !== id)
        : ingredients.map((i) => (i.id === id ? { id, quantity } : i))
      : [...ingredients, { id, quantity }];

    setIngredients(changed);
  };

  return (
    <ScreenModal title="STOCK" style={{ padding: 20 }} visible={visible} onClose={onClose}>
      <FlatList
        data={data}
        style={{ flexGrow: 1 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const { quantity = 0 } = ingredients.find((i) => i.id === item.id) ?? {};
          return <Card stock={item} onChange={onChange} defaultValue={quantity} />;
        }}
      />
      <StyledButton
        backgroundColor={colors.primary}
        onPress={() => {
          onSave(ingredients);
          onClose();
        }}
      >
        <StyledText center color="#FFFFFF">
          Guardar
        </StyledText>
      </StyledButton>
    </ScreenModal>
  );
};

type CreateRecipeProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateRecipe">;
};

const CreateRecipe: React.FC<CreateRecipeProps> = ({ navigation, route }) => {
  const defaultValue = route.params?.recipe;
  const inventory = route.params.inventory;

  const { control, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      inventoryID: inventory.id,
      value: defaultValue?.value || 0,
      ingredients: defaultValue?.ingredients || [],
      name: defaultValue?.name || "",
      description: defaultValue?.description || "",
      visible: defaultValue?.visible || true,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);

  const [optional, setOptional] = useState<boolean>(false);
  const [ingredientsModal, setIngredientsModal] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [valueModal, setValueModal] = useState<boolean>(false);

  const { description, ingredients, value } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${GET_TAB_NAME[inventory.visible]}` });
  }, [inventory]);

  const save = async (data: Recipe) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.recipe.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Recipe) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.recipe.put(data.id),
      method: "PUT",
      data,
    });
  };

  const cost = useMemo(
    () =>
      ingredients.reduce((a, b) => {
        const { currentValue = 0 } = stocks.find((s) => s.id === b.id) ?? {};
        return a + currentValue * b.quantity;
      }, 0),
    [ingredients, stocks],
  );

  const handleSaveOrUpdate = (data: Recipe) => (defaultValue ? update(data) : save(data));

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
                placeholder={`Nombre para ${GET_TAB_NAME[inventory.visible]}`}
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
          <StyledButton style={styles.row} onPress={() => setIngredientsModal(true)}>
            <StyledText>
              Ingredientes {!!ingredients.length && `(${ingredients.length} stock)`}
            </StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          {formState.errors.ingredients && (
            <StyledText color={colors.primary} verySmall>
              Los ingredientes son requeridos
            </StyledText>
          )}
          <StyledButton style={styles.row} onPress={() => setValueModal(true)}>
            <StyledText>Precio de venta {!!value && `(${thousandsSystem(value)})`}</StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          {formState.errors.value && (
            <StyledText color={colors.primary} verySmall>
              El valor de la receta es requerida
            </StyledText>
          )}
          <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
            <StyledText>Opcionales</StyledText>
            <Ionicons name={optional ? "caret-up" : "caret-down"} color={colors.text} />
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
              <Controller
                name="visible"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.row, { marginTop: 12 }]}>
                    <StyledText>Visibilidad en inventario</StyledText>
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
        {!!ingredients.length && (
          <View style={{ marginVertical: 15 }}>
            <StyledText>
              Costo de producción: <StyledText color="#f71010">{thousandsSystem(cost)}</StyledText>
            </StyledText>
            <StyledText>
              Valor de la receta:{" "}
              <StyledText color={colors.primary}>{thousandsSystem(value)}</StyledText>
            </StyledText>
            <StyledText>
              {value - cost > 0 ? "Ganancia" : "Perdida"}:{" "}
              <StyledText color={value - cost > 0 ? colors.primary : "#f71010"}>
                {thousandsSystem(value - cost)}
              </StyledText>
            </StyledText>
          </View>
        )}
        <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(handleSaveOrUpdate)}>
          <StyledText center color="#FFFFFF">
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <Controller
        name="ingredients"
        rules={{
          validate: (array) => {
            if (!array.length) return "La capacidad es requerida";
            return true;
          },
        }}
        control={control}
        render={({ field: { onChange, value } }) => (
          <IngredientsScreen
            defaultValue={value}
            visible={ingredientsModal}
            onClose={() => setIngredientsModal(false)}
            inventory={inventory}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InputScreenModal
            title="Descripción"
            placeholder={`Creá una buena descripción para ${GET_TAB_NAME[inventory.visible]}`}
            visible={descriptionModal}
            defaultValue={value}
            maxLength={3000}
            onClose={() => setDescriptionModal(false)}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="value"
        rules={{ validate: (num) => !!num }}
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Valor"
            description={() => "Escribe el valor de la receta"}
            defaultValue={value}
            isRemove={!!value}
            visible={valueModal}
            maxValue={999999999}
            onClose={() => setValueModal(false)}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default CreateRecipe;
