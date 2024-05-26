import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getFontSize, thousandsSystem, changeDate, random } from "@helpers/libs";
import { edit as EEconomy, remove as REconomy } from "@features/function/economySlice";
import { edit as EInventory } from "@features/inventory/informationSlice";
import { Swipeable } from "react-native-gesture-handler";
import PaymentManager from "@utils/supplier/debt/PaymentManager";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Information from "@components/Information";
import InventoryDebtInformation from "@utils/supplier/debt/Information";
import { removeEconomy, editEconomy, editInventory } from "@api";
import theme from "@theme";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const ElementCard = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const suppliers = useSelector((state) => state.suppliers);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const inventory = useSelector((state) => state.inventory);

  const [element, setElement] = useState(null);
  const [isName, setIsName] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [activeInformation, setActiveInformation] = useState(false);
  const [activePayment, setActivePayment] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => setElement(inventory.find((i) => i.id === item.element)), [item]);

  useEffect(() => {
    const found = suppliers.find((s) => s.id === item.supplier);
    if (found) setSupplier({ name: found.name, identification: found.identification });
    else setSupplier({ name: "ELIMINADO", identification: null });
  }, []);

  const deleteElement = () => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar la ${item.type === "entry" ? "entrada" : "salida"} de unidad?`,
      `No podrá recuperar esta información una vez borrada, Se elimará también el registro de ${
        item.type === "entry" ? "entrada" : "salida"
      } de inventario`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const editable = { ...element };
            editable[item.type] = editable[item.type].filter((e) => e.id !== item.id);
            dispatch(EInventory({ id: item.element, data: editable }));
            await editInventory({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              inventory: editable,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onSubmit = async (count, paymentMethod) => {
    const updatedItem = element[item.type].find((e) => e.id === item.id);
    if (!updatedItem) return;

    const method = [
      ...updatedItem.method,
      {
        id: random(6),
        method: paymentMethod,
        total: updatedItem.currentValue * count,
        quantity: count,
      },
    ];

    const status =
      updatedItem.quantity === method.reduce((a, b) => a + b.quantity, 0) ? "paid" : "credit";

    const updatedElement = {
      ...element,
      [item.type]: element[item.type].map((e) =>
        e.id === updatedItem.id ? { ...e, method, status } : e
      ),
    };

    dispatch(EInventory({ id: element.id, data: updatedElement }));
    await editInventory({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      inventory: updatedElement,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const leftSwipe = () => (
    <View style={{ justifyContent: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => setActiveInformation(!activeInformation)}
      >
        <Ionicons
          name="information-circle-outline"
          color={mode === "light" ? dark.main2 : light.main5}
          size={getFontSize(21)}
        />
      </TouchableOpacity>
    </View>
  );

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: "red" }]}
        onPress={() => deleteElement()}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = ({ children }) => (
    <Swipeable renderLeftActions={leftSwipe} renderRightActions={rightSwipe}>
      {children}
    </Swipeable>
  );

  return (
    <>
      <SwipeableValidation>
        <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
          <TouchableOpacity style={styles.row} onPress={() => setActivePayment(!activePayment)}>
            {supplier ? (
              <TouchableOpacity onPress={() => supplier.identification && setIsName(!isName)}>
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  {isName
                    ? supplier?.name?.slice(0, 15) + `${supplier?.name?.length >= 15 ? "..." : ""}`
                    : thousandsSystem(supplier?.identification)}
                </TextStyle>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="small" color={light.main2} />
            )}
            <TextStyle color={light.main2}>
              {thousandsSystem(item.currentValue * item.quantity)}/
              {thousandsSystem(item.method.reduce((a, b) => a + b.total, 0))}
            </TextStyle>
          </TouchableOpacity>
        </View>
      </SwipeableValidation>
      <PaymentManager
        modalVisible={activePayment}
        setModalVisible={setActivePayment}
        title={element?.name}
        item={item}
        value={item.currentValue}
        max={item.quantity - item.method.reduce((a, b) => a + b.quantity, 0)}
        onSubmit={onSubmit}
      />
      <InventoryDebtInformation
        modalVisible={activeInformation}
        setModalVisible={setActiveInformation}
        item={item}
        element={element}
        supplier={supplier}
      />
    </>
  );
};

const EconomyCard = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const suppliers = useSelector((state) => state.suppliers);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const economy = useSelector((state) => state.economy);

  const navigation = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isName, setIsName] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [activeInformation, setActiveInformation] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const found = suppliers.find((s) => s.id === item.ref);
    if (found) setSupplier({ name: found.name, identification: found.identification });
    else setSupplier({ name: "ELIMINADO", identification: null });
  }, []);

  const deleteEconomy = ({ id }) => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar los datos económicos?`,
      "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(REconomy({ id }));
            await removeEconomy({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              id,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const paid = ({ id }) => {
    Alert.alert("Hey", "¿Has pagado el monto restante, quieres terminar de pagar la deuda?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          const newEconomy = {
            ...economy.find((e) => e.id === id),
          };
          newEconomy.payment = item.amount;

          dispatch(EEconomy({ id, data: newEconomy }));
          await editEconomy({
            identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
            economy: newEconomy,
            helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
          });
        },
      },
    ]);
  };

  const leftSwipe = () => (
    <View style={{ justifyContent: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => setActiveInformation(!activeInformation)}
      >
        <Ionicons
          name="information-circle-outline"
          color={mode === "light" ? dark.main2 : light.main5}
          size={getFontSize(21)}
        />
      </TouchableOpacity>
    </View>
  );

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: "red" }]}
        onPress={() => deleteEconomy({ id: item.id })}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => {
          navigation.navigate("CreateEconomy", {
            item,
            editing: true,
          });
        }}
      >
        <Ionicons
          name="create"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = (
    { condition, children } //TODO COLOCARSELO A TODOS LOS QUE TENGA ESTO
  ) =>
    condition ? (
      <Swipeable renderLeftActions={leftSwipe} renderRightActions={rightSwipe}>
        {children}
      </Swipeable>
    ) : (
      <View>{children}</View>
    );

  return (
    <>
      <SwipeableValidation condition={!isOpen}>
        <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.row}>
            {supplier ? (
              <TouchableOpacity onPress={() => supplier.identification && setIsName(!isName)}>
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  {isName
                    ? supplier?.name?.slice(0, 15) + `${supplier?.name?.length >= 15 ? "..." : ""}`
                    : thousandsSystem(supplier?.identification)}
                </TextStyle>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="small" color={light.main2} />
            )}
            <TextStyle color={light.main2}>
              {thousandsSystem(item.amount)}/{thousandsSystem(item.payment)}
            </TextStyle>
          </TouchableOpacity>
          {isOpen && (
            <View style={{ marginTop: 15 }}>
              <View style={{ marginBottom: 20 }}>
                <TextStyle color={light.main2}>{item.name?.toUpperCase()}</TextStyle>
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  Total: <TextStyle color={light.main2}>{thousandsSystem(item.amount)}</TextStyle>
                </TextStyle>
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  Deuda:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.amount - item.payment)}
                  </TextStyle>
                </TextStyle>
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  Pagado: <TextStyle color={light.main2}>{thousandsSystem(item.payment)}</TextStyle>
                </TextStyle>
              </View>
              <View style={styles.row}>
                <ButtonStyle
                  backgroundColor={mode === "light" ? dark.main2 : light.main5}
                  style={{ width: SCREEN_WIDTH / 2.4 }}
                  onPress={() =>
                    navigation.navigate("CreateEconomy", {
                      type: item.type,
                      pay: true,
                      item: economy.find((e) => e.id === item.id),
                      editing: true,
                    })
                  }
                >
                  <TextStyle paragrahp center color={mode === "light" ? dark.textWhite : light.textDark}>
                    Abonar
                  </TextStyle>
                </ButtonStyle>
                <ButtonStyle
                  style={{ width: SCREEN_WIDTH / 2.4 }}
                  backgroundColor={light.main2}
                  onPress={() => paid({ id: item.id })}
                >
                  <TextStyle paragrahp color={mode === "light" ? dark.textWhite : light.textDark} center>
                    Pagado
                  </TextStyle>
                </ButtonStyle>
              </View>
            </View>
          )}
        </View>
      </SwipeableValidation>
      <Information
        modalVisible={activeInformation}
        setModalVisible={setActiveInformation}
        style={{ width: "90%" }}
        title="INFORMACIÓN"
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Más detalle de la deuda
            </TextStyle>
            <View style={{ marginTop: 15 }}>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Creación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.creationDate))}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Modificación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.modificationDate))}</TextStyle>
              </TextStyle>
            </View>
          </View>
        )}
      />
    </>
  );
};

const Debts = () => {
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const inventory = useSelector((state) => state.inventory);

  const [debtors, setDebtors] = useState(null);

  const debugInventory = () => {
    const selection = inventory.filter(
      (i) => i.entry.some((e) => e.status === "credit") || i.output.some((e) => e.status === "credit")
    );
    const data = selection.reduce(
      (a, b) => [
        ...a,
        ...b.entry.map((e) => ({ ...e, type: "entry" })),
        ...b.output.map((e) => ({ ...e, type: "output" })),
      ],
      []
    );
    const filtered = data.filter((e) => e.status === "credit");
    return filtered;
  };

  useEffect(() => {
    const inventoryElements = debugInventory();
    const economyFiltered = economy.filter((e) => e.amount !== e.payment);
    const sorted = [...inventoryElements, ...economyFiltered].sort(
      (a, b) => a.creationDate - b.creationDate
    );
    setDebtors([...sorted].reverse());
  }, [economy, inventory]);

  return (
    <Layout>
      <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
        Deudores
      </TextStyle>
      <View style={{ marginTop: 20 }}>
        {!debtors && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={light.main2} size="large" />
            <TextStyle
              style={{ marginTop: 8 }}
              center
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              CARGANDO
            </TextStyle>
          </View>
        )}
        {debtors?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY DEUDORES
          </TextStyle>
        )}
        {debtors && (
          <FlatList
            data={debtors}
            style={{
              flexGrow: 1,
              maxHeight: SCREEN_HEIGHT / 1.3,
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={1}
            renderItem={({ item }) =>
              item.element ? <ElementCard item={item} /> : <EconomyCard item={item} />
            }
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default Debts;
