import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { changeDate, thousandsSystem } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const DebtInformation = ({ modalVisible, setModalVisible, item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();

  const navigateToInformation = (id) =>
    navigation.navigate("CustomerInformation", {
      type: "individual",
      id,
    });

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      style={{ width: "90%" }}
      title="INFORMACIÓN"
      content={() => (
        <View>
          {item.agency.length > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextStyle color={textColor}>Agencia: </TextStyle>
              {item.agency?.map((agency) => (
                <TouchableOpacity onPress={() => navigateToInformation(agency.id)}>
                  <TextStyle color={light.main2}>- {agency.name} -</TextStyle>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextStyle color={textColor}>Dueño: </TextStyle>
            {item?.owner?.map((owner) => (
              <TouchableOpacity onPress={() => navigateToInformation(owner.id)}>
                <TextStyle color={light.main2}>- {owner.name} -</TextStyle>
              </TouchableOpacity>
            ))}
          </View>
          <TextStyle color={textColor}>
            Tipo de deuda: <TextStyle color={light.main2}>{item.type}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Total: <TextStyle color={light.main2}>{thousandsSystem(item.total || "0")}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Pagado: <TextStyle color={light.main2}>{thousandsSystem(item.paid || "0")}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Fecha de creación:{" "}
            <TextStyle color={light.main2}>{changeDate(new Date(item.creationDate))}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Fecha de modificación:{" "}
            <TextStyle color={light.main2}>{changeDate(new Date(item.modificationDate))}</TextStyle>
          </TextStyle>
        </View>
      )}
    />
  );
};

export default DebtInformation;
