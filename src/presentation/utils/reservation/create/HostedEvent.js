import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { random } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import AddPerson from "@components/AddPerson";
import theme from "@theme";

const { light, dark } = theme();

export const AddHosted = ({
  nomenclatureID,
  editing,
  setEditing,
  modalVisible,
  setModalVisible,
  settings = {},
  onChange,
  hosted,
}) => {
  const updateHosted = ({ data, cleanData }) => {
    data.id = editing.id;
    data.ref = editing.ref;
    data.owner = editing.owner;
    data.checkOut = editing.checkOut;
    const newArray = hosted.map((h) => {
      if (h.id === editing.id) return data;
      return h;
    });
    onChange(newArray);
    cleanData();
  };

  const saveHosted = ({ data, cleanData }) => {
    const id = random(10, { number: true });
    data.ref = nomenclatureID;
    data.id = id;
    data.owner = null;
    data.checkOut = null;
    onChange([...hosted, data]);
    cleanData();
  };

  return (
    <AddPerson
      key={editing.key}
      modalVisible={modalVisible}
      settings={settings}
      setModalVisible={setModalVisible}
      editing={editing}
      setEditing={setEditing}
      handleSubmit={(data) => {
        if (editing.active) updateHosted(data);
        else saveHosted(data);
      }}
    />
  );
};

export const Hosted = ({ item, personStaying, removeEvent, editingEvent }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
      ]}
    >
      <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
        {`${item.fullName.slice(0, 20)}${
          item.fullName.length > 20 ? "..." : ""
        }`}
      </TextStyle>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={() => editingEvent()}>
          <Ionicons
            name="create-outline"
            size={25}
            style={{ marginHorizontal: 4 }}
            color={mode === "light" ? light.textDark : dark.textWhite}
          />
        </TouchableOpacity>
        {(!personStaying || item.id !== personStaying[0].id) && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Eliminar",
                `¿Quieres eliminar el huésped ${item.fullName}?`,
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Si",
                    onPress: () => removeEvent(),
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Ionicons
              name="trash"
              size={25}
              style={{ marginHorizontal: 4 }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
