import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Information = ({
  modalVisible,
  setModalVisible,
  title,
  description,
  buttonText,
}) => {
  const mode = useSelector((state) => state.mode);

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent={false}
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: mode === 'light' ? light.main4 : dark.main2 }]}>
          <View style={{ marginBottom: 5 }}>
            <TextStyle center paragraph color={light.main2}>
              {title}
            </TextStyle>
            <TextStyle
              justify
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {description}
            </TextStyle>
          </View>
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <TextStyle verySmall>{buttonText}</TextStyle>
          </ButtonStyle>
        </View>
      </View>
      <StatusBar backgroundColor="#0004" />
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0004",
  },
  modalView: {
    margin: 20,
    borderRadius: 5,
    width: 180,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Information;
