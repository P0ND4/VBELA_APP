import React from "react";
import { Modal, TouchableWithoutFeedback, View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Element } from "domain/entities/data/common/element.entity";
import { thousandsSystem } from "shared/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  onPressEdit: (data: Element) => void;
  data: Element;
};

const CardModal: React.FC<ModalProps> = ({ visible, onClose, data, onPressEdit }) => {
  const { colors } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#0005" }]} />
      </TouchableWithoutFeedback>
      <View style={styles.cardPreviewContainer}>
        <TouchableOpacity onPress={() => onClose()}>
          <Ionicons name="close" color={colors.background} size={42} />
        </TouchableOpacity>
        <View style={[styles.cardPreview, { backgroundColor: colors.background }]}>
          <View style={[styles.backgroundImagePreview, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.enlarge, { backgroundColor: colors.background }]}
              onPress={() => alert("Para la tercera actualización")}
            >
              <Ionicons
                name="code"
                style={{ transform: [{ rotate: "-45deg" }] }}
                color={colors.text}
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 15 }}>
              <StyledText color={colors.primary}>{data.name}</StyledText>
              <StyledText>{data.description}</StyledText>
            </View>
            <View style={{ flexDirection: "row" }}>
              <StyledText subtitle color={colors.primary}>
                {thousandsSystem(data?.promotion || data?.price)}
              </StyledText>
              {(data?.promotion || 0) > 0 && (
                <StyledText
                  smallParagraph
                  style={{ marginLeft: 5, textDecorationLine: "line-through" }}
                >
                  {thousandsSystem(data?.price)}
                </StyledText>
              )}
            </View>
          </View>
        </View>
        <View style={[styles.row, { width: "50%", justifyContent: "space-evenly" }]}>
          <TouchableOpacity
            onPress={() => onPressEdit(data)}
            style={[styles.buttonPreviewContent, { backgroundColor: colors.background }]}
          >
            <Ionicons name="pencil" color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonPreviewContent, { backgroundColor: colors.background }]}
            onPress={() => alert("Para la tercera actualización")}
          >
            <Ionicons name="share-social" color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPreviewContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  cardPreview: {
    marginVertical: 20,
    width: "80%",
    borderRadius: 5,
  },
  buttonPreviewContent: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImagePreview: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  enlarge: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CardModal;
