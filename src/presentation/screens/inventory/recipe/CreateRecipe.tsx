import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import {
  RecipeIngredients,
  Inventory,
  Portion,
  Recipe,
  Stock,
  StockSubCategory,
} from "domain/entities/data/inventories";
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
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import { Group, GroupSubCategory } from "domain/entities/data";
import { Type } from "domain/enums/data/inventory/ingredient.enums";
import { useRecipeCost } from "../hooks/useRecipeCost";

const GET_TAB_NAME = {
  [Visible.Both]: "RECETAS/PAQUETES",
  [Visible.Restaurant]: "RECETAS",
  [Visible.Store]: "PAQUETES",
  [Visible.None]: "",
};

type PickerProps = { label: string; value: string };

type onChage = { id: string; quantity: number; type: Type };

type CardProps = {
  defaultValue: number;
  id: string;
  name: string;
  unit?: string;
  type: Type;
  onChange: (props: onChage) => void;
};

const Card: React.FC<CardProps> = ({ defaultValue, id, name, unit, onChange, type }) => {
  const { colors } = useTheme();

  const [quantity, setQuantity] = useState<number>(defaultValue);
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <StyledButton style={styles.row} onPress={() => setVisible(true)}>
        <StyledText>
          {name} {unit && `(${unit})`}
        </StyledText>
        <StyledText color={colors.primary}>{thousandsSystem(quantity)}</StyledText>
      </StyledButton>
      <CountScreenModal
        title="Cantidad"
        decimal={unit === "UND" || type === Type.Portion ? false : true}
        defaultValue={quantity}
        description={(quantity) =>
          quantity
            ? `Agregar ${thousandsSystem(quantity)} ${unit && `(${unit})`}`
            : "Agrega la cantidad a utilizar"
        }
        isRemove={!!quantity}
        visible={visible}
        maxValue={999999}
        onClose={() => setVisible(false)}
        onSave={(quantity) => {
          onChange({ id, quantity, type });
          setQuantity(quantity);
        }}
      />
    </>
  );
};

type IngredientsScreenProps = {
  defaultValue: RecipeIngredients[];
  inventory: Inventory;
  visible: boolean;
  onClose: () => void;
  onSave: (ingredients: RecipeIngredients[]) => void;
};

const IngredientsScreen: React.FC<IngredientsScreenProps> = ({
  defaultValue,
  inventory,
  visible,
  onClose,
  onSave,
}) => {
  const portions = useAppSelector((state) => state.portions);
  const stocks = useAppSelector((state) => state.stocks);

  const { colors } = useTheme();

  const [stockData, setStockData] = useState<Stock[]>([]);
  const [portionData, setPortionData] = useState<Portion[]>([]);
  const [ingredients, setIngredients] = useState<RecipeIngredients[]>(defaultValue);

  useEffect(() => {
    const found = stocks.filter((s) => s.inventoryID === inventory.id && s.visible);
    setStockData(found);
  }, [stocks]);

  useEffect(() => {
    const found = portions.filter((s) => s.inventoryID === inventory.id && s.visible);
    setPortionData(found);
  }, [portions]);

  const onChange = ({ id, quantity, type }: onChage) => {
    const found = ingredients.find((i) => i.id === id);

    const changed = found
      ? quantity === 0
        ? ingredients.filter((i) => i.id !== id)
        : ingredients.map((i) => (i.id === id ? { id, quantity, type } : i))
      : [...ingredients, { id, quantity, type }];

    setIngredients(changed);
  };

  return (
    <ScreenModal title="STOCK" style={{ padding: 20 }} visible={visible} onClose={onClose}>
      <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="albums-outline" color={colors.primary} size={25} />
            <StyledText style={{ marginLeft: 6 }}>STOCKS</StyledText>
          </View>
          {!!stockData.length ? (
            <FlatList
              data={stockData}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const { quantity = 0 } = ingredients.find((i) => i.id === item.id) ?? {};
                return (
                  <Card
                    id={item.id}
                    name={item.name}
                    unit={item.unit}
                    onChange={onChange}
                    defaultValue={quantity}
                    type={Type.Stock}
                  />
                );
              }}
            />
          ) : (
            <StyledText color={colors.primary}>NO SE ENCONTRARON PRODUCTOS EN STOCKS</StyledText>
          )}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="cube-outline" color={colors.primary} size={25} />
            <StyledText style={{ marginLeft: 6 }}>PORCIONES</StyledText>
          </View>
          {!!portionData.length ? (
            <FlatList
              data={portionData}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const { quantity = 0 } = ingredients.find((i) => i.id === item.id) ?? {};
                return (
                  <Card
                    id={item.id}
                    name={item.name}
                    onChange={onChange}
                    defaultValue={quantity}
                    type={Type.Portion}
                  />
                );
              }}
            />
          ) : (
            <StyledText color={colors.primary}>NO SE ENCONTRARON PORCIONES</StyledText>
          )}
        </View>
      </ScrollView>
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

  const { control, handleSubmit, watch, formState } = useForm<Recipe>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      inventoryID: inventory.id,
      value: defaultValue?.value || 0,
      ingredients: defaultValue?.ingredients || [],
      name: defaultValue?.name || "",
      description: defaultValue?.description || "",
      visible: defaultValue?.visible || true,
      categories: defaultValue?.categories || [],
      subcategories: defaultValue?.subcategories || [],
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const recipeGroup = useAppSelector((state) => state.recipeGroup);

  const [optional, setOptional] = useState<boolean>(false);
  const [ingredientsModal, setIngredientsModal] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [valueModal, setValueModal] = useState<boolean>(false);
  const [categoriesPickerModal, setCategoriesPickerModal] = useState<boolean>(false);
  const [subcategoriesPickerModal, setSubcategoriesPickerModal] = useState<boolean>(false);

  const [categoriesPicker, setCategoriesPicker] = useState<PickerProps[]>([]);
  const [subcategoriesPicker, setSubcategoriesPicker] = useState<PickerProps[]>([]);

  const { description, categories, subcategories, ingredients, value } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    setCategoriesPicker(recipeGroup.map((group) => ({ label: group.category, value: group.id })));
  }, [recipeGroup]);

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

  useEffect(() => {
    navigation.setOptions({
      title: `Crear ${GET_TAB_NAME[inventory.visible]}`,
      ...(defaultValue
        ? {
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  save({
                    ...defaultValue,
                    id: random(10),
                    name: `${defaultValue.name.slice(0, 26)} (1)`,
                  });
                }}
              >
                <Ionicons name="duplicate-outline" color={colors.text} size={25} />
              </TouchableOpacity>
            ),
          }
        : {}),
    });
  }, [inventory]);

  const cost = useRecipeCost(ingredients);

  const handleSaveOrUpdate = (data: Recipe) => (defaultValue ? update(data) : save(data));

  return (
    <>
      <Layout>
        <ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
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
              <StyledButton style={styles.row} onPress={() => setCategoriesPickerModal(true)}>
                <StyledText>
                  Categoría {!!categories.length && `(${categories.length}) seleccionado`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <StyledButton style={styles.row} onPress={() => setSubcategoriesPickerModal(true)}>
                <StyledText>
                  Sub - Categoría{" "}
                  {!!subcategories.length && `(${subcategories.length}) seleccionado`}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
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
        </ScrollView>
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
            if (!array.length) return "Los ingredientes son requeridos";
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
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Valor"
            decimal={true}
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
      <Controller
        name="categories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            data={categoriesPicker}
            multiple={value}
            title="CATEGORÍA"
            remove="Remover"
            noData="NO HAY CATEGORÍAS CREADAS"
            visible={categoriesPickerModal}
            onClose={() => setCategoriesPickerModal(false)}
            onSubmit={(categoryIDS) => {
              const subcategoriesPicker = recipeGroup
                .filter((g) => categoryIDS.includes(g.id))
                .flatMap((c) => c.subcategories.map((s) => ({ label: s.name, value: s.id })));

              setSubcategoriesPicker(subcategoriesPicker);
              onChange(categoryIDS);
            }}
          />
        )}
      />
      <Controller
        name="subcategories"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            data={subcategoriesPicker}
            multiple={value.map((va) => va.subcategory)}
            title="SUB - CATEGORÍAS"
            remove="Remover"
            noData="NO HAY SUB - CATEGORÍAS DISPONIBLES"
            visible={subcategoriesPickerModal}
            onClose={() => setSubcategoriesPickerModal(false)}
            onSubmit={(value) => {
              const subcategoryIDS = Array.isArray(value) ? value : [value];

              const categoriesMap = new Map<string, string>(
                recipeGroup.flatMap((group: Group) =>
                  group.subcategories.map((sub: GroupSubCategory) => [sub.id, group.id]),
                ),
              );
              const elementSubcategories: StockSubCategory[] = subcategoryIDS.map((id: string) => ({
                category: categoriesMap.get(id)!,
                subcategory: id,
              }));
              onChange(elementSubcategories);
            }}
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
