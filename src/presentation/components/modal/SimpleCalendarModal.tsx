import React, { useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { useTheme } from "@react-navigation/native";
import InformationModal from "./InformationModal";
import StyledText from "../text/StyledText";
import StyledButton from "../button/StyledButton";

type SimpleCalendarModalProps = {
  defaultValue: string;
  visible: boolean;
  onClose: () => void;
  onSave: (date: string) => void;
};

const SimpleCalendarModal: React.FC<SimpleCalendarModalProps> = ({
  defaultValue,
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();

  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    visible && setSelected(defaultValue.split("T")[0]);
  }, [visible]);

  return (
    <InformationModal title="CALENDARIO" animationType="fade" visible={visible} onClose={onClose}>
      <Calendar
        onDayPress={(day: DateData) => {
          setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: "orange" },
        }}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.primary,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          arrowColor: colors.text,
          monthTextColor: colors.text,
          indicatorColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: "#ffffff",
        }}
      />
      <StyledButton
        backgroundColor={colors.primary}
        onPress={() => {
          onSave(new Date(selected).toISOString());
          onClose();
        }}
        disable={!selected}
      >
        <StyledText center color="#FFFFFF">
          Guardar
        </StyledText>
      </StyledButton>
    </InformationModal>
  );
};

export default SimpleCalendarModal;
