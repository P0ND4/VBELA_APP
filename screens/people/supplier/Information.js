import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getFontSize, thousandsSystem, changeDate, print, generatePDF } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { remove as REconomy, removeManyByIds } from "@features/function/economySlice";
import { edit as EInventory, change as CInventory } from "@features/inventory/informationSlice";
import { removeEconomy, editInventory, editUser } from "@api";
import Logo from "@assets/logo.png";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Information from "components/Information";
import theme from "@theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const suppliers = useSelector((state) => state.suppliers);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const inventory = useSelector((state) => state.inventory);

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

  const deleteElement = () => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar la ${
        item.type === "entry" ? "entrada" : "salida"
      } de unidad?.`,
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
            const editable = { ...inventory.find((i) => i.id === item.element) };
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
        onPress={() => (item.supplier ? deleteElement({ item }) : deleteEconomy({ id: item.id }))}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      {!item.supplier && (
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
      )}
    </View>
  );

  const SwipeableValidation = ({ condition, children }) =>
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
            <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>{item.name}</TextStyle>
            <TextStyle color={light.main2}>{changeDate(new Date(item.modificationDate))}</TextStyle>
          </TouchableOpacity>
          {isOpen && (
            <View style={{ marginTop: 8 }}>
              {supplier ? (
                <TouchableOpacity onPress={() => supplier.identification && setIsName(!isName)}>
                  <TextStyle color={light.main2}>
                    {isName
                      ? supplier?.name?.slice(0, 15).toUpperCase() +
                        `${supplier?.name?.length >= 15 ? "..." : ""}`
                      : thousandsSystem(supplier?.identification)}
                  </TextStyle>
                </TouchableOpacity>
              ) : (
                <ActivityIndicator size="small" color={light.main2} />
              )}

              {item.amount - item.payment > 0 && (
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  Total: <TextStyle color={light.main2}>{thousandsSystem(item.amount)}</TextStyle>
                </TextStyle>
              )}
              {item.amount - item.payment > 0 && (
                <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                  Deuda:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.amount - item.payment)}
                  </TextStyle>
                </TextStyle>
              )}
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Pagado: <TextStyle color={light.main2}>{thousandsSystem(item.payment)}</TextStyle>
              </TextStyle>
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

const SupplierInformation = ({ route }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const suppliers = useSelector((state) => state.suppliers);
  const inventory = useSelector((state) => state.inventory);

  const [logs, setLogs] = useState(null);
  const [html, setHtml] = useState("");

  const type = route.params.type;
  const id = route.params.id;

  const dispatch = useDispatch();

  const debugInventory = ({ id = null }) => {
    const selection = inventory.filter(
      (i) => i.entry.some((e) => e.supplier) || i.output.some((e) => e.supplier)
    );
    const data = selection.flatMap((b) =>
      ["entry", "output"].flatMap((type) =>
        b[type]
          .filter((s) => s.supplier)
          .map((e) => ({
            ...e,
            type,
            name: `${b.name} (${type === "entry" ? "Entrada" : "Salida"})`,
            ref: e.supplier,
            amount: e.quantity * e.currentValue,
            payment: e?.method?.reduce((a, b) => a + b.total, 0),
            modificationDate: e.modificationDate,
            creationDate: e.creationDate,
          }))
      )
    );
    return data.filter((e) => e.supplier === id || !id);
  };

  useEffect(() => {
    if (type === "individual")
      setLogs(
        [...economy.filter((e) => e.ref === id), ...debugInventory({ id })]
          .sort((a, b) => a.creationDate - b.creationDate)
          .reverse()
      );
    else
      setLogs(
        [...economy, ...debugInventory({ id: null })]
          .sort((a, b) => a.creationDate - b.creationDate)
          .reverse()
      );
  }, [id, economy, inventory]);

  useEffect(() => {
    const getHTML = () => {
      setHtml(`
    <body>
    <view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
    <view>
    <img
    src="${Image.resolveAssetSource(Logo).uri}" 
    style="width: 22vw; display: block; margin: 0 auto; border-radius: 8px" />
    <p style="font-size: 30px; text-align: center">vbelapp.com</p>
    </view>
    <p style="font-size: 30px; text-align: center; margin: 20px 0; background-color: #444444; padding: 10px 0; color: #FFFFFF">DETALLES - ${
      type === "individual" ? "ESPECÍFICO" : "GENERAL"
    }</p>    
        <view>
        ${logs.reduce((a, item) => {
          const supplier = suppliers.find((supplier) => supplier.id === item.ref);

          return (
            a +
            `<table style="width: 100%; margin: 20px 0; border: 1px solid #444444;">
            <tr>
              <td style="text-align: left; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">${
                  supplier ? supplier.name.toUpperCase() : "ELIMINADO"
                }</p>
              </td>
              <td style="text-align: left; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">${item.name.toUpperCase()}</p>
              </td>
            </tr>
            <tr/>
            <tr>
              <td style="text-align: left; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">Creación</p>
              </td>
              <td style="text-align: right; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">
                  ${changeDate(new Date(item.creationDate))}
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align: left; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">Modificación</p>
              </td>
              <td style="text-align: right; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">
                  ${changeDate(new Date(item.modificationDate))}
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align: left; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">Total</p>
              </td>
              <td style="text-align: right; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">
                  ${thousandsSystem(item.amount)}
                </p>
              </td>
            </tr>
            <tr/>
            <tr>
              <td style="text-align: left; grid-column: span 2; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">${
                  item.amount !== item.payment ? "PENDIENTE" : "PAGADO"
                }</p>
              </td>
              <td style="text-align: right; border: 1px solid #444444;">
                <p style="font-size: 28px; font-weight: 600;">
                  ${item.amount - item.payment > 0 ? thousandsSystem(item.amount - item.payment) : ""}
                </p>
              </td>
            </tr>
          </table>`
          );
        }, "")}
        </view>
        <p style="text-align: center; font-weight: 600; margin-top: 20px; font-size: 25px; font-weight: 600;">Total:
        ${thousandsSystem(logs.reduce((a, b) => (a += parseInt(b.amount)), 0))}</p>
        <p style="text-align: center; font-size: 25px; font-weight: 600;">${changeDate(
          new Date()
        )} ${new Date().getHours()}:${new Date().getMinutes()}</p>
    </view>
    </body>
    `);
    };
    if (logs) getHTML();
  }, [logs]);

  const removeEverything = () => {
    Alert.alert(
      "¿Estás seguro que quieres eliminar todo el registro?",
      "No podrá recuperar la información una vez borrada (Se aplicará también para inventario)",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const inventoryLogs = logs
              .filter((l) => l.supplier)
              .map((log) => ({ element: log.element, id: log.id }));

            const updatedInventory = inventory.map((i) => {
              const found = inventoryLogs.find((inv) => inv.element === i.id);
              if (!found) return i;
              const newEntry = i.entry.filter((e) => e.id !== found.id);
              const newOutput = i.output.filter((o) => o.id !== found.id);
              return {
                ...i,
                entry: newEntry,
                output: newOutput,
                modificationDate: new Date().getTime(),
              };
            });

            const economyIDS = logs.filter((l) => !l.supplier).map((log) => log.id);
            dispatch(removeManyByIds({ ids: economyIDS }));
            dispatch(CInventory(updatedInventory));
            await editUser({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              change: {
                economy: economy.filter((e) => !economyIDS.some((id) => e.id === id)),
                inventory: updatedInventory,
              },
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Layout>
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          {type === "individual" ? "Específico" : "General"}
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {logs?.length > 0 && (
            <TouchableOpacity onPress={() => removeEverything()}>
              <Ionicons
                name="trash"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity onPress={() => print({ html })}>
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity onPress={() => generatePDF({ html })}>
              <Ionicons
                name="document-attach"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {/*logs?.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )*/}
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        {!logs && (
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
        {logs?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY REGISTROS
          </TextStyle>
        )}
        {logs && (
          <FlatList
            data={logs}
            style={{
              flexGrow: 1,
              maxHeight: SCREEN_HEIGHT / 1.3,
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={1}
            renderItem={({ item }) => <Card item={item} />}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

export default SupplierInformation;
