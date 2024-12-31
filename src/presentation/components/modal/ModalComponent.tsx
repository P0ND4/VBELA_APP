import { View, StyleSheet, TouchableWithoutFeedback, Modal } from "react-native";
import React from "react";

type ModalProps = {
  visible: boolean;
  children?: React.ReactNode;
  onClose: () => void;
};

const ModalComponent: React.FC<ModalProps> = ({ visible, children, onClose, ...rest }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...rest}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#0005" }]} />
      </TouchableWithoutFeedback>
      {children}
    </Modal>
  );
};

export default ModalComponent;
