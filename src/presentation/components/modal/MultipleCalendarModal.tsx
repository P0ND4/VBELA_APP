import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { useTheme } from "@react-navigation/native";
import InformationModal from "./InformationModal";
import StyledText from "../text/StyledText";
import StyledButton from "../button/StyledButton";
import moment from "moment";
import theme from "config/calendar/theme";

type ValueProps = { start: number; end: number };

type MarkedDate = {
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
};

type MarkedDates = {
  [date: string]: MarkedDate;
};

type MultipleCalendarModalProps = {
  defaultValue?: ValueProps | null;
  visible: boolean;
  initialDate?: string;
  maxDate?: string;
  minDate?: string;
  onClose: () => void;
  onSave: (props: ValueProps) => void;
};

const MultipleCalendarModal: React.FC<MultipleCalendarModalProps> = ({
  defaultValue,
  visible,
  initialDate,
  maxDate,
  minDate,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const generateMarkedDates = (start: string, end: string) => {
    const startMoment = moment(start);
    const endMoment = moment(end);
    let date = startMoment.clone(); // Clona el objeto para evitar modificaciones

    const newMarkedDates: MarkedDates = {};

    while (date.isSameOrBefore(endMoment, "day")) {
      const dateString = date.format("YYYY-MM-DD");
      if (date.isSame(startMoment, "day")) {
        // Inicio del rango
        newMarkedDates[dateString] = {
          startingDay: true,
          color: colors.primary,
          textColor: "#FFFFFF",
        };
      } else if (date.isSame(endMoment, "day")) {
        // Fin del rango
        newMarkedDates[dateString] = {
          endingDay: true,
          color: colors.primary,
          textColor: "#FFFFFF",
        };
      } else {
        // Fechas intermedias
        newMarkedDates[dateString] = {
          color: colors.primary,
          textColor: "#FFFFFF",
        };
      }
      date = date.add(1, "days"); // Avanza al siguiente día
    }

    setMarkedDates(newMarkedDates); // Actualiza el estado con las fechas marcadas
  };

  const reboot = () => {
    setStartDate(null);
    setEndDate(null);
    setMarkedDates({});
  };

  const handleDayPress = (day: { dateString: string }) => {
    const { dateString } = day;

    if (startDate === dateString) return reboot(); // Reinicia todo

    if (!startDate || (startDate && endDate)) {
      // Reinicia la selección si no hay fecha inicial o ya hay un rango completo
      setStartDate(dateString);
      setEndDate(null);
      setMarkedDates({
        [dateString]: {
          startingDay: true,
          endingDay: true,
          color: colors.primary,
          textColor: "#FFFFFF",
        },
      });
    } else {
      // Completa el rango si ya hay una fecha inicial
      setEndDate(dateString);
      generateMarkedDates(startDate, dateString);
    }
  };

  useEffect(() => {
    if (visible && defaultValue?.start && defaultValue?.end) {
      const startDate = moment(defaultValue.start).format("YYYY-MM-DD");
      const endDate = moment(defaultValue.end).format("YYYY-MM-DD");
      generateMarkedDates(startDate, endDate);
    } else reboot();
  }, [visible]);

  return (
    <InformationModal title="PERIODO" animationType="fade" visible={visible} onClose={onClose}>
      <Calendar
        markingType={"period"}
        initialDate={initialDate}
        maxDate={maxDate}
        minDate={minDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={theme(colors)}
      />
      <StyledButton
        backgroundColor={colors.primary}
        onPress={() => {
          const dates = Object.keys(markedDates);

          const start = moment(dates[0]).startOf("day").valueOf();
          const end = moment(dates.at(-1)).endOf("day").valueOf();

          onSave({ start, end });
          onClose();
        }}
        disable={!Object.keys(markedDates).length}
      >
        <StyledText center color="#FFFFFF">
          Guardar
        </StyledText>
      </StyledButton>
    </InformationModal>
  );
};

export default MultipleCalendarModal;
