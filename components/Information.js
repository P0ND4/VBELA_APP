import {
  Modal,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import theme from "@theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const { light, dark } = theme();

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  default: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const Information = ({
  modalVisible,
  setModalVisible,
  title,
  content = () => {},
  style,
  headerRight = () => {},
  onClose = () => {},
}) => {
  const stylesTaken = [styles.default, style];

  const mode = useSelector((state) => state.mode);

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent={false}
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
        onClose();
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          setModalVisible(!modalVisible);
          onClose();
        }}
      >
        <View style={[{ backgroundColor: "#0004" }, StyleSheet.absoluteFillObject]} />
      </TouchableWithoutFeedback>
      <View style={styles.centeredView}>
        <View
          style={[
            { backgroundColor: mode === "light" ? light.main4 : dark.main2 },
            stylesTaken,
          ]}
        >
          <View style={{ width: "100%" }}>
            <View style={styles.row}>
              <TextStyle center bigSubtitle color={light.main2}>
                {title}
              </TextStyle>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {headerRight()}
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    onClose();
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {content()}
          </View>
        </View>
      </View>
      <StatusBar backgroundColor="#0004" />
    </Modal>
  );
};

export default Information;
