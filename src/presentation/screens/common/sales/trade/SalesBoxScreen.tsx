import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { useOrder } from "application/context/OrderContext";
import { Save, Element, Order, Group, GroupSubCategory } from "domain/entities/data/common";
import { Pad } from "presentation/screens/common/NumericPad";
import { send } from "../utils/transform.element";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import SalesButtonBottom from "../components/SalesButtonBottom";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import ScreenModal from "presentation/components/modal/ScreenModal";
import SalesCard from "../components/SalesCard";
import GroupSection from "presentation/components/layout/GroupSection";

type UnregisteredModalProps = {
  visible: boolean;
  onClose: () => void;
  locationID: string;
  onSave: (item: Element, register: boolean) => void;
};

const UnregisteredModal: React.FC<UnregisteredModalProps> = ({
  visible,
  onClose,
  onSave,
  locationID,
}) => {
  const { colors } = useTheme();

  const [value, setValue] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);

  const clean = () => {
    setRegister(false);
    setName("");
    setValue(0);
  };

  return (
    <>
      <ScreenModal
        title="Vender ítem no registrado"
        visible={visible}
        onClose={() => {
          onClose();
          clean();
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={[styles.center, { flex: 2 }]}>
            <StyledText bigTitle>{thousandsSystem(value)}</StyledText>
            <TouchableOpacity
              onPress={() => setDescriptionModal(true)}
              style={{ opacity: !value ? 0.6 : 1 }}
              disabled={!value}
            >
              <StyledText color={colors.primary} smallSubtitle style={{ marginTop: 15 }}>
                Añadir nombre
              </StyledText>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 4 }}>
            <Pad
              buttonText="Enviar al carrito"
              value={value}
              onChange={(value: number) => setValue(value)}
              maxValue={9999999999}
              condition={value > 0}
              onSave={() => {
                onSave(send({ name, value, locationID }), register);
                onClose();
                clean();
              }}
            />
          </View>
        </View>
      </ScreenModal>
      <ScreenModal
        title="Descripción"
        visible={descriptionModal}
        onClose={() => {
          setDescriptionModal(false);
          clean();
        }}
      >
        <Layout>
          <View style={[{ flexGrow: 1 }, styles.center]}>
            <View style={{ width: "100%" }}>
              <TextInput
                value={name}
                style={[
                  styles.inputDescription,
                  { color: colors.text, borderColor: colors.primary },
                ]}
                placeholderTextColor={colors.border}
                placeholder="Escriba el nombre"
                maxLength={30}
                onChangeText={setName}
              />
              <View style={[styles.row, styles.descriptionToggle]}>
                <StyledText>Registrar producto producto</StyledText>
                <Switch
                  value={register}
                  onValueChange={setRegister}
                  thumbColor={register ? colors.primary : colors.card}
                />
              </View>
            </View>
          </View>
          <StyledButton
            backgroundColor={colors.primary}
            style={{ marginTop: 10 }}
            disable={!name}
            onPress={() => {
              onSave(send({ name, value, locationID }), register);
              setDescriptionModal(false);
              onClose();
              clean();
            }}
          >
            <StyledText center color="#FFFFFF">
              Guardar
            </StyledText>
          </StyledButton>
        </Layout>
      </ScreenModal>
    </>
  );
};

type SalesBoxScreenProps = {
  defaultValue?: Order;
  groups: Group[];
  elements: Element[];
  sendButton: () => void;
  addElement: (data: Element) => void;
  onPressEdit: (data: Element) => void;
  onPressGroup: (group?: Group) => void;
  locationID: string;
  tableID?: string;
  buttonsEvent: {
    delivery?: () => void;
    kitchen?: (props: Save, order: Order | null) => void;
  };
};

const SalesBoxScreen: React.FC<SalesBoxScreenProps> = ({
  defaultValue,
  groups,
  elements,
  locationID,
  tableID,
  sendButton = () => {},
  onPressEdit = () => {},
  onPressGroup = () => {},
  addElement = () => {},
  buttonsEvent = {},
}) => {
  const { colors } = useTheme();
  const { selection, addSelection, change } = useOrder();

  useEffect(() => {
    defaultValue && change(defaultValue);
  }, []);

  const [countModal, setCountModal] = useState<boolean>(false);
  const [unregisteredModal, setUnregisteredModal] = useState<boolean>(false);

  const [count, setCount] = useState<number>(1);
  const [data, setData] = useState<Element[]>([]);
  const [search, setSearch] = useState<string>("");

  const [categorySelected, setCategorySelected] = useState<Group | null>(null);
  const [subcategorySelected, setSubcategorySelected] = useState<GroupSubCategory | null>(null);

  useEffect(() => {
    setCategorySelected(null);
    setSubcategorySelected(null);
  }, [groups]);

  useEffect(() => {
    let sort = [...elements].sort((a, b) => {
      if (b.highlight !== a.highlight) return b.highlight ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    if (search)
      sort = sort.filter(
        (element) =>
          element.name.toLowerCase().includes(search.toLowerCase()) ||
          element.description.toLowerCase().includes(search.toLowerCase()) ||
          element.code.includes(search),
      );

    if (categorySelected)
      sort = sort.filter((element) => element.categories.includes(categorySelected.id));

    if (subcategorySelected)
      sort = sort.filter((element) =>
        element.subcategories.some((s) => s.subcategory === subcategorySelected.id),
      );

    setData(sort);
  }, [elements, search, categorySelected, subcategorySelected]);

  const renderItemElement: ListRenderItem<Element> = useCallback(
    ({ item }) => (
      <>
        <SalesCard
          onLongPress={() => onPressEdit(item)}
          data={item}
          onPress={() => addSelection(item, true, count)}
        />
        <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
      </>
    ),
    [count, addSelection],
  );

  return (
    <>
      <Layout>
        {!elements.length ? (
          <StyledText color={colors.primary}>NO HAY ELEMENTOS REGISTRADOS</StyledText>
        ) : (
          <>
            <View style={styles.row}>
              <StyledInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre"
              />
              <View style={{ flexDirection: "row" }}>
                <StyledButton
                  style={[{ marginHorizontal: 8, width: "auto" }, styles.headerButton]}
                  onPress={() => setUnregisteredModal(true)}
                >
                  <Ionicons name="flash-outline" size={20} color={colors.primary} />
                </StyledButton>
                <StyledButton style={styles.headerButton} onPress={() => setCountModal(true)}>
                  <StyledText>{thousandsSystem(count)}x</StyledText>
                </StyledButton>
              </View>
            </View>
            <GroupSection
              groups={groups}
              group={categorySelected}
              subGroup={subcategorySelected}
              onPressCreateGroup={onPressGroup}
              onPressGroup={(item) => {
                setSubcategorySelected(null);
                if (categorySelected?.id === item.id) setCategorySelected(null);
                else setCategorySelected(item);
              }}
              onPressSubGroup={(item) => {
                if (subcategorySelected?.id === item.id) setSubcategorySelected(null);
                else setSubcategorySelected(item);
              }}
            />
            {!data.length && (
              <StyledText color={colors.primary} style={{ marginTop: 8 }}>
                NO SE ENCONTRARON RESULTADOS
              </StyledText>
            )}
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderItemElement}
              style={{ marginTop: 8, flexGrow: 1 }}
            />
            <SalesButtonBottom
              locationID={locationID}
              tableID={tableID}
              onPress={() => {
                if (!selection.length)
                  return Alert.alert("OOPS!", "No hay elementos seleccionados");
                sendButton();
              }}
              name={
                !selection.length
                  ? "Ningún pedido registrado"
                  : `(${selection.reduce((a, b) => a + b.quantity, 0)}) Seleccionado`
              }
              buttonsEvent={{ ...buttonsEvent }}
            />
          </>
        )}
      </Layout>
      <CountScreenModal
        title="Cantidad"
        description={(count) =>
          count ? `Vender ${thousandsSystem(count)} unidad del próximo item` : "Adicione un valor"
        }
        defaultValue={count}
        visible={countModal}
        onClose={() => setCountModal(false)}
        onSave={(value) => setCount(value)}
      />
      <UnregisteredModal
        locationID={locationID}
        visible={unregisteredModal}
        onClose={() => setUnregisteredModal(false)}
        onSave={(item, register) => {
          register && addElement(item);
          addSelection(item, register, count);
        }}
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
  headerButton: {
    paddingHorizontal: 14,
    width: "auto",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  descriptionToggle: {
    paddingVertical: 10,
  },
  inputDescription: {
    marginVertical: 15,
    paddingVertical: 8,
    fontSize: 18,
    borderBottomWidth: 2,
  },
});

export default SalesBoxScreen;
