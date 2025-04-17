import { StyleSheet, View } from "react-native";
import React from "react";
import InformationModal from "./InformationModal";
import StyledText from "../text/StyledText";
import StyledButton from "../button/StyledButton";

type Buttons = { text: string; onPress?: () => void };

type AlertModalProps = {
  title: string;
  description: string;
  visible: boolean;
  buttons?: Buttons[];
  onClose: () => void;
};

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  description,
  onClose,
  visible,
  buttons = [],
}) => {
  return (
    <InformationModal
      title={title}
      styleCard={styles.alert}
      animationType="fade"
      visible={visible}
      onClose={onClose}
    >
      <StyledText style={{ marginVertical: 6 }}>{description}</StyledText>
      <View style={{ alignItems: "flex-end", justifyContent: "flex-end" }}>
        {buttons.map((button) => (
          <StyledButton
            key={button.text}
            auto
            onPress={() => {
              onClose();
              button?.onPress && button.onPress();
            }}
          >
            <StyledText smallParagraph>{button.text}</StyledText>
          </StyledButton>
        ))}
      </View>
    </InformationModal>
  );
};

const styles = StyleSheet.create({
  alert: { minHeight: 150, paddingHorizontal: 20 },
});

export default AlertModal;
