import { useState, useEffect, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem, changeDate } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import theme from "@theme";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import AddPerson from "@components/AddPerson";

const { light, dark } = theme();

const HostedInformation = ({
  item,
  modalVisible,
  setModalVisible,
  showMore = () => {},
  complement = () => {},
  updateHosted = () => {},
  settings = {},
  showMoreRight = () => {},
  showMoreLeft = () => {},
  event = () => {},
  remove = () => {},
}) => {
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);

  const [open, setIsOpen] = useState(false);
  const [activeEdit, setActiveEdit] = useState(false);
  const [handler, setHandler] = useState({
    active: true,
    key: Math.random(),
  });

  const navigation = useNavigation();

  const getBackgroundColor = (mode) => (mode === "light" ? dark.main2 : light.main4);
  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  return (
    <>
      <Information
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onClose={() => setIsOpen(false)}
        style={{ width: "90%" }}
        title="INFORMACIÓN"
        headerRight={() => (
          <TouchableOpacity onPress={() => setActiveEdit(!activeEdit)}>
            <Ionicons name="create-outline" color={textColor} size={30} />
          </TouchableOpacity>
        )}
        content={() => (
          <>
            <ScrollView style={{ maxHeight: 360, marginTop: 15 }} showsVerticalScrollIndicator={false}>
              <TextStyle color={textColor}>
                Nombre completo: <TextStyle color={light.main2}>{item.fullName}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Correo electrónico: <TextStyle color={light.main2}>{item.email}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Cédula: <TextStyle color={light.main2}>{thousandsSystem(item.identification)}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Número de teléfono: <TextStyle color={light.main2}>{item.phoneNumber}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                País: <TextStyle color={light.main2}>{item.country}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Cliente: <TextStyle color={light.main2}>{item?.customer ? "SI" : "NO"}</TextStyle>
              </TextStyle>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextStyle color={textColor}>CHECK IN: </TextStyle>
                <TouchableOpacity onPress={() => event("checkIn")}>
                  <TextStyle color={light.main2}>
                    {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
                  </TextStyle>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextStyle color={textColor}>CHECK OUT: </TextStyle>
                <TouchableOpacity onPress={() => event("checkOut")}>
                  <TextStyle color={light.main2}>
                    {item.checkOut ? changeDate(new Date(item.checkOut)) : "NO"}
                  </TextStyle>
                </TouchableOpacity>
              </View>
              {complement()}
              {open && showMore()}
            </ScrollView>
            <View style={{ marginTop: 15 }}>
              {showMore() && (
                <View style={styles.row}>
                  {showMoreLeft()}
                  <ButtonStyle
                    backgroundColor={open ? backgroundColor : light.main2}
                    onPress={() => setIsOpen(!open)}
                    style={{ width: "auto", flexGrow: 4 }}
                  >
                    <TextStyle center color={open && mode === "light" ? dark.textWhite : light.textDark}>
                      {open ? "Mostrar menos" : "Mostrar más"}
                    </TextStyle>
                  </ButtonStyle>
                  {showMoreRight()}
                </View>
              )}
              <View style={styles.row}>
                {(() => {
                  const order = sales.find(
                    (o) => o.ref === (item.owner || item.id) && o.status === "pending"
                  );
                  return (
                    <ButtonStyle
                      backgroundColor={!order ? light.main2 : backgroundColor}
                      style={{ width: "49%" }}
                      onPress={() => {
                        navigation.navigate("Sales", {
                          ref: item.owner || item.id,
                          title: { name: "Habitación", value: item.fullName },
                          order,
                        });
                      }}
                    >
                      <TextStyle center>P&S</TextStyle>
                    </ButtonStyle>
                  );
                })()}
                {(() => {
                  const order = orders.find(
                    (o) => o.ref === (item.owner || item.id) && o.status === "pending"
                  );
                  return (
                    <ButtonStyle
                      onPress={() => {
                        navigation.navigate("RestaurantCreateOrder", {
                          ref: item.owner || item.id,
                          title: { name: "Habitación", value: item.fullName },
                          order,
                        });
                      }}
                      style={{ width: "49%" }}
                      backgroundColor={!order ? light.main2 : backgroundColor}
                    >
                      <TextStyle center>Menú</TextStyle>
                    </ButtonStyle>
                  );
                })()}
              </View>
              <ButtonStyle backgroundColor={light.main2} onPress={() => remove()}>
                <TextStyle center>Eliminar huésped</TextStyle>
              </ButtonStyle>
            </View>
          </>
        )}
      />
      <AddPerson
        key={handler.key}
        setEditing={setHandler}
        modalVisible={activeEdit}
        setModalVisible={setActiveEdit}
        settings={settings}
        editing={{ active: true, ...item }}
        handleSubmit={(data) => {
          const cleanData = () => {
            data.cleanData();
            setActiveEdit(!activeEdit);
          };
          updateHosted({ ...data, cleanData });
        }}
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
});

export default HostedInformation;
