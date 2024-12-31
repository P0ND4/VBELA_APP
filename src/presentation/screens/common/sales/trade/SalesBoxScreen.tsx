import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { random, thousandsSystem } from "shared/utils";
import { useOrder } from "application/context/OrderContext";
import { Save, Element, Order } from "domain/entities/data/common";
import { Pad } from "presentation/screens/common/NumericPad";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import SalesButtonBottom from "../components/SalesButtonBottom";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import ScreenModal from "presentation/components/modal/ScreenModal";
import SalesCard from "../components/SalesCard";

type CardModalProps = {
  visible: boolean;
  onClose: () => void;
  onPressEdit: (data: Element) => void;
  data: Element;
};

const CardModal: React.FC<CardModalProps> = ({ visible, onClose, data, onPressEdit }) => {
  const { colors } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#0005" }]} />
      </TouchableWithoutFeedback>
      <View style={styles.cardPreviewContainer}>
        <TouchableOpacity onPress={() => onClose()}>
          <Ionicons name="close" color={colors.background} size={42} />
        </TouchableOpacity>
        <View style={[styles.cardPreview, { backgroundColor: colors.background }]}>
          <View style={[styles.backgroundImagePreview, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.enlarge, { backgroundColor: colors.background }]}
              onPress={() => alert("Para la tercera actualización")}
            >
              <Ionicons
                name="code"
                style={{ transform: [{ rotate: "-45deg" }] }}
                color={colors.text}
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 15 }}>
              <StyledText color={colors.primary}>{data.name}</StyledText>
              <StyledText>{data.description}</StyledText>
            </View>
            <View style={{ flexDirection: "row" }}>
              <StyledText subtitle color={colors.primary}>
                {thousandsSystem(data?.promotion || data?.price)}
              </StyledText>
              {(data?.promotion || 0) > 0 && (
                <StyledText smallParagraph style={{ marginLeft: 5 }} lineThrough>
                  {thousandsSystem(data?.price)}
                </StyledText>
              )}
            </View>
          </View>
        </View>
        <View style={[styles.row, { width: "50%", justifyContent: "space-evenly" }]}>
          <TouchableOpacity
            onPress={() => onPressEdit(data)}
            style={[styles.buttonPreviewContent, { backgroundColor: colors.background }]}
          >
            <Ionicons name="pencil" color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonPreviewContent, { backgroundColor: colors.background }]}
            onPress={() => alert("Para la tercera actualización")}
          >
            <Ionicons name="share-social" color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

type CardProps = {
  item: Element;
  onPress?: () => void;
  onPressEdit: (data: Element) => void;
};

const Card: React.FC<CardProps> = ({ item, onPressEdit, onPress }) => {
  const { colors } = useTheme();

  // const [modalVisible, setModalVisible] = useState<boolean>(false);

  // const onToggle = () => setModalVisible(!modalVisible);

  return (
    <>
      <SalesCard onLongPress={() => onPressEdit(item)} data={item} onPress={onPress} />
      <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
      {/* <CardModal visible={modalVisible} onClose={onToggle} data={item} onPressEdit={onPressEdit} /> */}
    </>
  );
};

type ModalProps = {
  visible: boolean;
  onClose: () => void;
};

const FilterModal: React.FC<ModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <ScreenModal title="Filtro" visible={visible} onClose={onClose}>
      <Layout>
        <StyledButton style={styles.row}>
          <StyledText>Categoría</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
        <StyledButton style={styles.row}>
          <StyledText>Sub - Categoría</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
      </Layout>
    </ScreenModal>
  );
};

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

  const send = ({ name = "Sin nombre" }: { name?: string } = {}) => ({
    id: random(10),
    name,
    price: value,
    locationID,
    creationDate: new Date().getTime(),
    modificationDate: new Date().getTime(),
  });

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
                onSave(send(), register);
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
              onSave(send({ name }), register);
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
  elements: Element[];
  sendButton: () => void;
  addElement: (data: Element) => void;
  onPressEdit: (data: Element) => void;
  locationID: string;
  tableID?: string;
  buttonsEvent: {
    delivery?: () => void;
    kitchen?: (props: Save, order: Order | null) => void;
  };
};

const SalesBoxScreen: React.FC<SalesBoxScreenProps> = ({
  defaultValue,
  elements,
  locationID,
  tableID,
  sendButton = () => {},
  onPressEdit = () => {},
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
  const [filterModal, setFilterModal] = useState<boolean>(false);

  const [count, setCount] = useState<number>(1);
  const [data, setData] = useState<Element[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const sort = [...elements].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0));

    if (search) {
      const filtered = sort.filter((s) => {});
      setData(filtered);
    } else setData(sort);
  }, [elements, search]);

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
              <View style={{ flexDirection: "row", marginLeft: 8 }}>
                {/* <StyledButton
                  style={styles.headerButton}
                  onPress={() => {
                    alert("Para la tercera actualización");
                    // setFilterModal(true)
                  }}
                >
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                </StyledButton> */}
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
            {!data.length && (
              <StyledText color={colors.primary} style={{ marginTop: 8 }}>
                NO SE ENCONTRARON RESULTADOS
              </StyledText>
            )}
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card
                  item={item}
                  onPressEdit={onPressEdit}
                  onPress={() => addSelection(item, true, count)}
                />
              )}
              style={{ marginTop: 8 }}
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
      <FilterModal visible={filterModal} onClose={() => setFilterModal(false)} />
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
  cardPreviewContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  cardPreview: {
    marginVertical: 20,
    width: "80%",
    borderRadius: 5,
  },
  buttonPreviewContent: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImagePreview: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  enlarge: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SalesBoxScreen;
