import { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import InputStyle from "@components/InputStyle";
import Information from "@components/Information";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Table = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);

  const [order, setFound] = useState(null);

  const getTextColor = (mode) => (mode === "light" ? dark.textWhite : light.textDark);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? dark.main2 : light.main4);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  useEffect(() => {
    setFound(orders.find((o) => o.ref === item.id && ["kitchen", "pending"].includes(o.status)));
  }, [orders]);

  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => navigation.navigate("TableInformation", { id: item.id })}>
        <TextStyle
          color={!order ? light.main2 : backgroundColor}
          style={{ marginRight: 8 }}
          smallSubtitle
        >
          {item.table}
        </TextStyle>
      </TouchableOpacity>
      <ButtonStyle
        style={{ width: SCREEN_WIDTH / 1.6 }}
        backgroundColor={!order ? light.main2 : backgroundColor}
        onPress={() => {
          navigation.navigate("RestaurantCreateOrder", {
            ref: item.id,
            title: { name: "Mesa", value: item.table },
            order,
          });
        }}
      >
        <View style={[styles.row, { justifyContent: "center" }]}>
          <TextStyle color={!order ? dark.textWhite : textColor}>
            Menu
          </TextStyle>
          <Ionicons
            name="book-outline"
            size={19}
            style={{ marginLeft: 10 }}
            color={!order ? dark.textWhite : textColor}
          />
        </View>
      </ButtonStyle>
      <Ionicons
        name={order ? "receipt-outline" : "checkbox"}
        size={36}
        color={!order ? light.main2 : backgroundColor}
      />
    </View>
  );
};

const Tables = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const tables = useSelector((state) => state.tables);
  const orders = useSelector((state) => state.orders);

  const [delivery, setDelivery] = useState(null);
  const [found, setFound] = useState(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [AMPM, setAMPM] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const pendingRef = useRef();

  useEffect(() => {
    setDelivery(orders.filter((o) => o.ref === "delivery" && ["kitchen", "pending"].includes(o.status)));
  }, [orders]);

  useEffect(() => {
    const getDate = () => {
      const date = new Date();
      let hour = date.getHours();

      if (hour >= 12) setAMPM("PM");
      else setAMPM("AM");

      if (hour > 12) hour -= 12;

      setHours(hour);
      setMinutes(("0" + date.getMinutes()).slice(-2));
      setSeconds(("0" + date.getSeconds()).slice(-2));
    };
    getDate();
    const interval = setInterval(() => getDate(), 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => setFound(tables), [tables]);

  return (
    <>
      <Layout>
        <View style={{ width: "100%" }}>
          <View style={styles.row}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextStyle smallTitle color={light.main2}>
                Hoy
              </TextStyle>
              <TextStyle style={{ marginLeft: 10 }} color={textColor}>
                {`${hours}:${minutes}:${seconds} ${AMPM}`}
              </TextStyle>
            </View>
            {tables?.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate("CreateTable")}>
                <Ionicons name="add-circle" size={37} color={light.main2} />
              </TouchableOpacity>
            )}
          </View>
          <TextStyle bigParagraph color={textColor}>
            Disponibles
          </TextStyle>
        </View>
        <View>
          <View style={[styles.row, { marginTop: 30, marginBottom: 15 }]}>
            <TextStyle bigParagraph color={textColor}>
              Mesas
            </TextStyle>
            <View>
              <View style={{ display: "none" }}>
                <Picker
                  ref={pendingRef}
                  mode="dropdown"
                  onValueChange={(order) =>
                    order &&
                    navigation.navigate("RestaurantCreateOrder", {
                      ref: "delivery",
                      title: { name: "Modo", value: "Delivery" },
                      order,
                    })
                  }
                >
                  <Picker.Item
                    key=""
                    label="SELECCIONE EL PEDIDO"
                    value=""
                    style={{ backgroundColor: mode === "light" ? light.main5 : dark.main2 }}
                    color={textColor}
                  />
                  {delivery?.map((order) => (
                    <Picker.Item
                      key={order.id}
                      label={order.id}
                      value={order}
                      style={{ backgroundColor: mode === "light" ? light.main5 : dark.main2 }}
                      color={textColor}
                    />
                  ))}
                </Picker>
              </View>
              <ButtonStyle
                backgroundColor={
                  delivery?.length > 0 ? (mode === "light" ? dark.main2 : light.main5) : light.main2
                }
                style={{ width: "auto" }}
                onLongPress={() => delivery?.length > 0 && pendingRef.current?.focus()}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <TextStyle smallParagraph>Domicilio</TextStyle>
              </ButtonStyle>
            </View>
          </View>
          {found !== null ? (
            <FlatList
              data={found}
              style={{ maxHeight: SCREEN_HEIGHT / 1.5 }}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <Table item={item} />}
            />
          ) : (
            <ActivityIndicator size="small" color={light.main2} />
          )}
          {found?.length === 0 && (
            <ButtonStyle
              onPress={() => navigation.navigate("CreateTable")}
              backgroundColor={light.main2}
            >
              <TextStyle center>Agregar mesa</TextStyle>
            </ButtonStyle>
          )}
        </View>
      </Layout>
      <Information
        onClose={() => {
          setName("");
          setPhoneNumber("");
          setAddress("");
        }}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title="DATOS"
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Escribe los datos del cliente para su posterior delivery
            </TextStyle>
            <View style={{ marginVertical: 10 }}>
              <InputStyle
                stylesContainer={styles.dataCollection}
                value={name}
                onChangeText={(text) => setName(text)}
                placeholder="Nombre"
                maxLength={30}
              />
              <InputStyle
                stylesContainer={styles.dataCollection}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text)}
                keyboardType="phone-pad"
                placeholder="Teléfono"
                maxLength={15}
              />
              <InputStyle
                stylesContainer={styles.dataCollection}
                value={address}
                onChangeText={(text) => setAddress(text)}
                placeholder="Dirección"
                maxLength={120}
              />
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                navigation.navigate("RestaurantCreateOrder", {
                  ref: "delivery",
                  delivery: `${name} - ${phoneNumber} - ${address}`,
                  title: { name: "Modo", value: "Delivery" },
                });
              }}
            >
              <TextStyle center>Seguir</TextStyle>
            </ButtonStyle>
          </View>
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dataCollection: {
    borderColor: light.main2,
    borderBottomWidth: 1,
  },
});

export default Tables;
