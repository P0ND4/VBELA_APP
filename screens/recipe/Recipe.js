import { useEffect, useMemo, useState } from "react";
import { View, Alert, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem, changeDate, getFontSize } from "@helpers/libs";
import { FlatList, Swipeable } from "react-native-gesture-handler";
import { remove } from "@features/sales/recipesSlice";
import { useNavigation } from "@react-navigation/native";
import { removeRecipe } from "@api";
import Information from "@components/Information";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const Element = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={styles.row}>
      <View style={[styles.table, { borderColor: textColor }]}>
        <TextStyle smallParagraph color={textColor}>
          {item.name}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor }]}>
        <TextStyle smallParagraph color={textColor}>
          {thousandsSystem(item.quantity) + item.unit}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor }]}>
        <TextStyle smallParagraph color={textColor}>
          {thousandsSystem(item.value)}
        </TextStyle>
      </View>
    </View>
  );
};

const Card = ({ item, type, onSelected }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const inventory = useSelector((state) => state.inventory);

  const [isOpen, setIsOpen] = useState(false);
  const [activeInformation, setActiveInformation] = useState(false);
  const [data, setData] = useState([]);

  const [activeDuplicate, setActiveDuplicate] = useState(false);
  const [newName, setNewName] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const data = item.ingredients.map((i) => {
      const element = inventory.find((e) => e.id === i.id);
      return { ...i, value: element?.currentValue * i.quantity };
    });
    setData(data);
  }, [item]);

  const onRemoveRecipe = () =>
    Alert.alert(
      "ELIMINAR",
      `¿Estás seguro que desea eliminar ${type === "sales" ? "el reconteo" : "la receta"} ${item.name}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(remove({ id: item?.id }));
            await removeRecipe({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              id: item.id,
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );

  const onSubmit = () => {
    Alert.alert(
      "SELECCIONAR",
      `¿Estás seguro que desea seleccionar ${type === "sales" ? "el reconteo" : "la receta"} ${
        item.name
      }?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            onSelected(item);
            navigation.pop();
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

  const RightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: "red" }]}
        onPress={() => onRemoveRecipe()}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => navigation.navigate("CreateRecipe", { item, type })}
      >
        <Ionicons
          name="create"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => onSubmit()}
      >
        <Ionicons
          name="send-outline"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => setActiveDuplicate(!activeDuplicate)}
      >
        <Ionicons
          name="copy"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = ({ condition, children }) =>
    condition ? (
      <Swipeable renderLeftActions={leftSwipe} renderRightActions={RightSwipe}>
        {children}
      </Swipeable>
    ) : (
      <View>{children}</View>
    );

  return (
    <>
      <SwipeableValidation condition={!isOpen}>
        <View
          style={[
            styles.card,
            { backgroundColor: mode === "light" ? light.main5 : dark.main2, flexGrow: 1 },
          ]}
        >
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.row}>
            <TextStyle color={textColor}>{item.name}</TextStyle>
            <TextStyle color={light.main2}>
              {thousandsSystem(data.reduce((a, b) => a + b.value, 0))}/{thousandsSystem(item?.value)}
            </TextStyle>
          </TouchableOpacity>
          {isOpen && (
            <View style={{ marginTop: 15 }}>
              <TextStyle color={light.main2}>{item.name}</TextStyle>
              <View style={{ marginVertical: 10 }}>
                <View style={styles.row}>
                  <View style={[styles.table, { borderColor: textColor }]}>
                    <TextStyle smallParagraph color={light.main2}>
                      Ingrediente
                    </TextStyle>
                  </View>
                  <View style={[styles.table, { borderColor: textColor }]}>
                    <TextStyle smallParagraph color={light.main2}>
                      Cantidad
                    </TextStyle>
                  </View>
                  <View style={[styles.table, { borderColor: textColor }]}>
                    <TextStyle smallParagraph color={light.main2}>
                      Valor
                    </TextStyle>
                  </View>
                </View>
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <Element item={item} />}
                  scrollEnabled={false}
                />
              </View>
              <View style={styles.row}>
                <TextStyle color={textColor}>
                  Total:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(data.reduce((a, b) => a + b.value, 0))}
                  </TextStyle>
                </TextStyle>
                <RightSwipe />
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
            <TextStyle smallParagraph color={textColor}>
              Más detalle {type === "sales" ? "del reconteo" : "de la receta"}
            </TextStyle>
            <View style={{ marginTop: 15 }}>
              <TextStyle color={textColor}>
                Creación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.creationDate))}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Modificación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.modificationDate))}</TextStyle>
              </TextStyle>
            </View>
          </View>
        )}
      />
      <Information
        modalVisible={activeDuplicate}
        setModalVisible={setActiveDuplicate}
        style={{ width: "90%" }}
        title="DUPLICAR"
        content={() => (
          <View>
            <TextStyle smallParagraph color={textColor}>
              Escriba el nuevo nombre de la receta a duplicar
            </TextStyle>
            <InputStyle
              stylesContainer={{ borderBottomWidth: 1, borderColor: light.main2 }}
              placeholder="Nuevo nombre"
              value={newName}
              onChangeText={(text) => setNewName(text)}
            />
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                navigation.navigate("CreateRecipe", {
                  defaultValue: {
                    ...item,
                    name: newName,
                  },
                  type,
                });
                setNewName("");
              }}
            >
              <TextStyle center>Guardar</TextStyle>
            </ButtonStyle>
          </View>
        )}
      />
    </>
  );
};

const Recipe = ({ route, navigation }) => {
  const recipes = useSelector((state) => state.recipes);
  const inventory = useSelector((state) => state.inventory);
  const mode = useSelector((state) => state.mode);

  const [data, setData] = useState([]);
  const [utility, setUtility] = useState(0);

  const type = route.params?.type;
  const onSelected = route.params?.onSelected;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const recipeFiltered = recipes.filter((r) => r.type === type);
    setData(recipeFiltered);

    const recipeValue = recipeFiltered.reduce((a, b) => a + b.value, 0);
    const ingrediets = recipeFiltered.reduce((a, b) => [...a, ...b.ingredients], []);
    const expenses = ingrediets.reduce((a, b) => {
      const element = inventory.find((e) => e.id === b.id);
      return a + element?.currentValue * b.quantity;
    }, 0);

    setUtility(recipeValue - expenses);
  }, [type, recipes]);

  useEffect(() => {
    navigation.setOptions({ title: type === "sales" ? "Reconteo" : "Receta" });
  }, [type]);

  return (
    <Layout>
      {data.length > 0 && (
        <View style={styles.row}>
          <TextStyle color={textColor}>
            Utilidad neta:{" "}
            <TextStyle color={utility < 0 ? "#F70000" : light.main2}>
              {thousandsSystem(utility)}
            </TextStyle>
          </TextStyle>
          <TouchableOpacity onPress={() => navigation.navigate("CreateRecipe", { type })}>
            <Ionicons name="add-circle" color={light.main2} size={getFontSize(26)} />
          </TouchableOpacity>
        </View>
      )}
      {data.length === 0 && (
        <View
          style={[StyleSheet.absoluteFillObject, { justifyContent: "center", alignItems: "center" }]}
        >
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ width: "auto" }}
            onPress={() => navigation.navigate("CreateRecipe", { type })}
          >
            <TextStyle center>Crear {type === "sales" ? "Reconteo" : "Receta"}</TextStyle>
          </ButtonStyle>
        </View>
      )}
      {data.length > 0 && (
        <FlatList
          data={data}
          style={{ marginTop: 10 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} type={type} onSelected={onSelected} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  card: {
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  table: {
    width: SCREEN_WIDTH / 3.6,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Recipe;
