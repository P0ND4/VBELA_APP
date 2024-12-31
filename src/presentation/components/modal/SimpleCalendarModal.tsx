import React, { useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { useTheme } from "@react-navigation/native";
import InformationModal from "./InformationModal";
import StyledText from "../text/StyledText";
import StyledButton from "../button/StyledButton";
import moment from "moment";
import theme from "config/calendar/theme";

type SimpleCalendarModalProps = {
  defaultValue?: number | null;
  visible: boolean;
  initialDate?: string;
  maxDate?: string;
  minDate?: string;
  onClose: () => void;
  onSave: (date: number) => void;
};

const SimpleCalendarModal: React.FC<SimpleCalendarModalProps> = ({
  defaultValue,
  visible,
  initialDate,
  maxDate,
  minDate,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();

  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    visible && setSelected(defaultValue ? moment(defaultValue).format("YYYY-MM-DD") : "");
  }, [visible]);

  return (
    <InformationModal title="CALENDARIO" animationType="fade" visible={visible} onClose={onClose}>
      <Calendar
        onDayPress={(day: DateData) => {
          setSelected(day.dateString);
        }}
        initialDate={initialDate}
        maxDate={maxDate}
        minDate={minDate}
        markedDates={{
          [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: "orange" },
        }}
        theme={theme(colors)}
      />
      <StyledButton
        backgroundColor={colors.primary}
        onPress={() => {
          onSave(moment(selected).valueOf());
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
