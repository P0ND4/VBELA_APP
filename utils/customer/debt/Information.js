import { useMemo } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { changeDate, thousandsSystem } from "@helpers/libs";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const DebtInformation = ({ modalVisible, setModalVisible, item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      style={{ width: "90%" }}
      title="INFORMACIÓN"
      content={() => (
        <View>
          {item.agency && (
            <TextStyle color={textColor}>
              Agencia: <TextStyle color={light.main2}>{item.agency}</TextStyle>
            </TextStyle>
          )}
          <TextStyle color={textColor}>
            Dueño: <TextStyle color={light.main2}>{item.owner}</TextStyle>
          </TextStyle>
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
