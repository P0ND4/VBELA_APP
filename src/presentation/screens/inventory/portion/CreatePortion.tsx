import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import {
  Portion,
  PortionIngredients,
  Stock,
  StockSubCategory,
} from "domain/entities/data/inventories";
import { add, edit } from "application/slice/inventories/portions.slice";
import { useTheme } from "@react-navigation/native";
import { random, thousandsSystem } from "shared/utils";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  InventoryRouteProp,
  RootInventory,
} from "domain/entities/navigation/root.inventory.entity";
import { Group, GroupSubCategory } from "domain/entities/data";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import apiClient from "infrastructure/api/server";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";
import endpoints from "config/constants/api.endpoints";

type PickerProps = { label: string; value: string };

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
        decimal={stock?.unit === "UND" ? false : true}
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
  defaultValue: PortionIngredients[];
  inventoryID: string;
  visible: boolean;
  onClose: () => void;
  onSave: (ingredients: PortionIngredients[]) => void;
};

const IngredientsScreen: React.FC<IngredientsScreenProps> = ({
  defaultValue,
  inventoryID,
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);

  const [data, setData] = useState<Stock[]>([]);
  const [ingredients, setIngredients] = useState<PortionIngredients[]>(defaultValue);

  useEffect(() => {
    const found = stocks.filter((s) => s.inventoryID === inventoryID && s.visible);
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
  route: InventoryRouteProp<"CreatePortion">;
};

const CreatePortion: React.FC<CreateRecipeProps> = ({ navigation, route }) => {
  const { emit } = useWebSocketContext();

  const defaultValue = route.params?.portion;
  const inventoryID = route.params.inventoryID;

  const { control, handleSubmit, watch, formState } = useForm<Portion>({
    defaultValues: {
      id: defaultValue?.id || random(10),
      inventoryID,
      ingredients: defaultValue?.ingredients || [],
      name: defaultValue?.name || "",
      description: defaultValue?.description || "",
      visible: defaultValue?.visible || true,
      categories: defaultValue?.categories || [],
      quantity: defaultValue?.quantity || 0,
      subcategories: defaultValue?.subcategories || [],
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const portionGroup = useAppSelector((state) => state.portionGroup);

  const [loading, setLoading] = useState<boolean>(false);
  const [optional, setOptional] = useState<boolean>(false);
  const [ingredientsModal, setIngredientsModal] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [categoriesPickerModal, setCategoriesPickerModal] = useState<boolean>(false);
  const [subcategoriesPickerModal, setSubcategoriesPickerModal] = useState<boolean>(false);

  const [categoriesPicker, setCategoriesPicker] = useState<PickerProps[]>([]);
  const [subcategoriesPicker, setSubcategoriesPicker] = useState<PickerProps[]>([]);

  const { description, categories, subcategories, ingredients } = watch();

  const dispatch = useAppDispatch();

  useEffect(() => {
    setCategoriesPicker(portionGroup.map((group) => ({ label: group.category, value: group.id })));
  }, [portionGroup]);

  const save = async (data: Portion) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.portion.post(),
      method: "POST",
      data,
    });
    emit("accessToInventory");
  };

  const update = async (data: Portion) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.portion.put(data.id),
      method: "PUT",
      data,
    });
    emit("accessToInventory");
  };

  useEffect(() => {
    navigation.setOptions({
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
  }, []);

  const handleSaveOrUpdate = (data: Portion) => {
    setLoading(true);
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
                placeholder="Nombre para la porción"
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
              Stocks {!!ingredients.length && `(${ingredients.length} stock)`}
            </StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          {formState.errors.ingredients && (
            <StyledText color={colors.primary} verySmall>
              Los stocks son requeridos
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
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          loading={loading}
          onPress={handleSubmit(handleSaveOrUpdate)}
        >
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
            inventoryID={inventoryID}
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
            placeholder="Creá una buena descripción para la porción"
            visible={descriptionModal}
            defaultValue={value}
            maxLength={3000}
            onClose={() => setDescriptionModal(false)}
            onSubmit={onChange}
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
              const subcategoriesPicker = portionGroup
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
                portionGroup.flatMap((group: Group) =>
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

export default CreatePortion;
