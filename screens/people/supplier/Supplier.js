import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import { removePerson } from "@api";
import { removeManyByRef } from "@features/function/economySlice";
import { remove as RSupplier } from "@features/people/suppliersSlice";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import Filters from "@utils/people/supplier/Filters";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { light, dark } = theme();

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const economy = useSelector((state) => state.economy);

  const navigation = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isName, setIsName] = useState(true);
  const [amount, setAmount] = useState(null);
  const [paid, setPaid] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => setIsName(true), [item.identification]);

  useEffect(() => {
    const debts = economy.filter((e) => e.amount !== e.payment && e.ref === item.id);
    setAmount(debts.reduce((a, b) => a + b.amount, 0));
    setPaid(debts.reduce((a, b) => a + b.payment, 0));
  }, [economy]);

  const removeSupplier = async ({ id, removeEconomy }) => {
    // Aqui eliminamos
    dispatch(RSupplier({ id })); //Removemos el proveedor de redux
    if (removeEconomy) dispatch(removeManyByRef({ ref: id })); // Si removeEconomy es verdadera eliminamos todo lo referente a economía del proveedor
    await removePerson({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      person: {
        type: "supplier",
        id,
        removeEconomy,
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const deleteSupplier = ({ id }) => {
    // Aqui preguntamos
    Alert.alert(
      "Oye!",
      "¿Estás seguro que desea eliminar el proveedor?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: () => {
            const economies = economy.filter((e) => e.ref === id);
            if (!economies.length) return removeSupplier({ id, removeEconomy: false });

            Alert.alert(
              //Preguntamos si quiere eliminar la economía
              "Bien",
              "¿Quieres eliminar los datos económicos hecho por el proveedor?",
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "No",
                  onPress: async () => removeSupplier({ id, removeEconomy: false }),
                },
                {
                  text: "Si",
                  onPress: async () => removeSupplier({ id, removeEconomy: true }),
                },
              ],
              { cancelable: true }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[
          styles.swipe,
          {
            backgroundColor: "red",
          },
        ]}
        onPress={() => deleteSupplier(item)}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.swipe,
          {
            backgroundColor: light.main2,
          },
        ]}
        onPress={() => {
          navigation.navigate("CreatePerson", {
            type: "supplier",
            person: item,
            editing: true,
          });
        }}
      >
        <Ionicons
          name="create"
          size={getFontSize(22)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = (
    { condition, children } //TODO COLOCARSELO A TODOS LOS QUE TENGA ESTO
  ) =>
    condition ? (
      <Swipeable renderRightActions={rightSwipe}>{children}</Swipeable>
    ) : (
      <View>{children}</View>
    );

  return (
    <SwipeableValidation condition={!isOpen}>
      <View
        style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}
      >
        <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.row}>
          <TouchableOpacity onPress={() => item.identification && setIsName(!isName)}>
            <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
              {isName
                ? item?.name?.slice(0, 15) + `${item?.name?.length >= 15 ? "..." : ""}`
                : thousandsSystem(item?.identification)}
            </TextStyle>
          </TouchableOpacity>
          {amount !== null && paid !== null ? (
            <TextStyle color={light.main2}>
              {thousandsSystem(amount)}/{thousandsSystem(paid)}
            </TextStyle>
          ) : (
            <ActivityIndicator size="small" color={light.main2} />
          )}
        </TouchableOpacity>
        {isOpen && (
          <View style={{ marginTop: 15 }}>
            <View style={styles.row}>
              <ButtonStyle
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                style={{ width: SCREEN_WIDTH / 2.4 }}
                onPress={() => {
                  navigation.navigate("CreateEconomy", {
                    type: "purchase",
                    ref: item.id,
                  });
                }}
              >
                <TextStyle
                  paragrahp
                  center
                  color={mode === "light" ? dark.textWhite : light.textDark}
                >
                  Compra / Costos
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                style={{ width: SCREEN_WIDTH / 2.4 }}
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                onPress={() => {
                  navigation.navigate("CreateEconomy", {
                    type: "expense",
                    ref: item.id,
                  });
                }}
              >
                <TextStyle
                  paragrahp
                  color={mode === "light" ? dark.textWhite : light.textDark}
                  center
                >
                  Gasto / Inversión
                </TextStyle>
              </ButtonStyle>
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                navigation.navigate("SupplierInformation", {
                  type: "individual",
                  id: item.id,
                });
              }}
            >
              <TextStyle center paragrahp>
                Detalles
              </TextStyle>
            </ButtonStyle>
          </View>
        )}
      </View>
    </SwipeableValidation>
  );
};

const Supplier = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const suppliers = useSelector((state) => state.suppliers);

  const [people, setPeople] = useState(null);
  const [activeSearch, setActiveSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);
  const [search, setSearch] = useState("");
  const initialState = {
    active: false,
    identification: "",
    day: "all",
    month: "all",
    year: "all",
  };
  const [filters, setFilters] = useState(initialState);

  const dateValidation = (date, dateCompare) => {
    let error = false;
    if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day) error = true;
    if (dateCompare.month !== "all" && date.getMonth() + 1 !== dateCompare.month) error = true;
    if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year) error = true;
    return error;
  };

  useEffect(() => {
    setPeople(null);
    if (search || filters) {
      const suppliersFiltered = suppliers.filter((supplier) => {
        if (
          supplier.name.toLowerCase()?.includes(search.toLowerCase()) ||
          supplier.identification?.includes(search) ||
          thousandsSystem(supplier.identification)?.includes(search)
        ) {
          if (!filters.active) return supplier;
          if (
            dateValidation(new Date(supplier.creationDate), {
              day: filters.day,
              month: filters.month,
              year: filters.year,
            })
          )
            return;
          if (filters.identification === "yes-identification" && !supplier.identification)
            return;
          if (filters.identification === "no-identification" && supplier.identification)
            return;

          return supplier;
        }
      });
      setPeople([...suppliersFiltered].reverse());
    } else setPeople([...suppliers].reverse());
  }, [suppliers, search, filters]);

  const searchRef = useRef();

  return (
    <Layout>
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          General
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {suppliers.length !== 0 && (
            <TouchableOpacity
              style={{ marginHorizontal: 4 }}
              onPress={() => {
                setActiveSearch(!activeSearch);
                setTimeout(() => searchRef.current?.focus());
              }}
            >
              <Ionicons name="search" size={getFontSize(28)} color={light.main2} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ marginHorizontal: 4 }}
            onPress={() => navigation.navigate("SupplierInformation", { type: "general" })}
          >
            <Ionicons name="document-text" size={getFontSize(28)} color={light.main2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginHorizontal: 4 }}
            onPress={() => navigation.navigate("CreatePerson", { type: "supplier" })}
          >
            <Ionicons name="add-circle" size={getFontSize(28)} color={light.main2} />
          </TouchableOpacity>
        </View>
      </View>
      {activeSearch && (
        <View
          style={[
            styles.row,
            {
              width: "100%",
              marginTop: 10,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setActiveSearch(false);
              setSearch("");
              setFilters(initialState);
            }}
          >
            <Ionicons
              name="close"
              size={getFontSize(24)}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          </TouchableOpacity>
          <InputStyle
            innerRef={searchRef}
            placeholder="Buscar (Nombre, Cédula, Cotos, Etc)"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "78%", marginVertical: 0 }}
            stylesInput={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons name="filter" size={getFontSize(24)} color={light.main2} />
          </TouchableOpacity>
        </View>
      )}
      <ButtonStyle
        style={{ marginVertical: 15, width: SCREEN_WIDTH / 2.5 }}
        onPress={() => navigation.navigate("SupplierDebts")}
        backgroundColor={light.main2}
      >
        <TextStyle center smallParagraph>
          DEUDAS
        </TextStyle>
      </ButtonStyle>
      <View>
        {!people && (
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
        {people?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY PROVEEDORES
          </TextStyle>
        )}
        {people && (
          <FlatList
            data={people}
            style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.4 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={1}
            renderItem={({ item }) => <Card item={item} />}
          />
        )}
      </View>
      <Filters
        setActive={setActiveFilter}
        active={activeFilter}
        setFilters={setFilters}
        filters={filters}
        initialState={initialState}
      />
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
    borderRadius: 8,
  },
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default Supplier;
