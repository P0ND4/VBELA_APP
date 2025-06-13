import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, Alert, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import { changeDate } from "shared/utils";
import { remove } from "application/slice/handlers/handlers.slice";
import apiClient from "infrastructure/api/server";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import StyledButton from "../button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "../text/StyledText";
import moment from "moment";
import SimpleCalendarModal from "../modal/SimpleCalendarModal";
import MultipleCalendarModal from "../modal/MultipleCalendarModal";
import { Handler } from "domain/entities/data";
import endpoints from "config/constants/api.endpoints";

export const filterByDate = <T extends { creationDate: number }>(
  items: T[],
  date: DateType,
): T[] => {
  return items.filter(
    (item) =>
      date.type === Type.All ||
      (moment(item.creationDate).isSameOrAfter(date.start) &&
        moment(item.creationDate).isSameOrBefore(date.end)),
  );
};

export enum Type {
  All = "Todos",
  Date = "Fecha",
  Period = "Periodo",
  Controller = "Controlador",
}

type FilterButtonProps = {
  name: string;
  selected?: boolean;
  onPress: () => void;
};

const FilterButton: React.FC<FilterButtonProps> = ({ name, onPress, selected }) => {
  const { colors } = useTheme();

  return (
    <StyledButton
      backgroundColor={selected ? colors.primary : colors.card}
      style={styles.filterButton}
      onPress={onPress}
    >
      <StyledText verySmall color={selected ? "#FFFFFF" : colors.text}>
        {name}
      </StyledText>
    </StyledButton>
  );
};

export type DateType = {
  id: string | null;
  start: number | null;
  end: number | null;
  type: Type;
};

export const resetDate = {
  id: "Day",
  type: Type.Date,
  start: moment(Date.now()).startOf("day").valueOf(),
  end: moment(Date.now()).endOf("day").valueOf(),
};

export const startEndTextHandler = (date: DateType) => {
  const dateChanged = (d: number) => changeDate(new Date(d), Type.Controller === date.type);
  const period = `${dateChanged(date.start!)} - ${dateChanged(date.end!)}`;

  if (Type.Date === date.type) return changeDate(new Date(date.start!));
  if ([Type.Controller, Type.Period].includes(date.type)) return period;
  return "Todos";
};

type FullFilterDateProps = {
  date: DateType;
  setDate: (date: DateType) => void;
  style?: StyleProp<ViewStyle>;
};

const FullFilterDate: React.FC<FullFilterDateProps> = ({ date, setDate, style }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const handlers = useAppSelector((state) => state.handlers);

  const [data, setData] = useState<Handler[]>();

  const [simpleCalendarModal, setSimpleCalendarModal] = useState<boolean>(false);
  const [multipleCalendarModal, setMultipleCalendarModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setData(handlers);
  }, [handlers]);

  const startEndText = useMemo(() => startEndTextHandler(date), [date]);

  const removeItem = async (id: string) => {
    setDate(resetDate);
    dispatch(remove({ id }));
    await apiClient({
      url: endpoints.handler.delete(id),
      method: "DELETE",
    });
    emit("accessToStatistics");
  };

  return (
    <View style={style}>
      <StyledButton style={styles.row} onPress={() => setSimpleCalendarModal(true)}>
        <Ionicons name="chevron-back" size={15} color={colors.text} />
        <StyledText center>{startEndText}</StyledText>
        <Ionicons name="chevron-forward" size={15} color={colors.text} />
      </StyledButton>
      <FlatList
        data={data}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        horizontal
        ItemSeparatorComponent={() => <View style={{ marginHorizontal: 4 }} />}
        renderItem={({ item }) => (
          <StyledButton
            style={styles.filterButton}
            onLongPress={() =>
              Alert.alert(
                "EY!",
                "¿Está seguro que desea eliminar el controlador (apertura/cierre) de caja?",
                [
                  { text: "No estoy seguro", style: "cancel" },
                  {
                    text: "Estoy seguro",
                    onPress: () => removeItem(item.id),
                  },
                ],
                { cancelable: true },
              )
            }
            onPress={() => {
              setDate({ id: item.id, type: Type.Controller, start: item.start, end: item.end });
            }}
            backgroundColor={date.id === item.id ? colors.primary : colors.card}
          >
            <StyledText verySmall color={date.id === item.id ? "#FFFFFF" : colors.text}>
              Apertura: {changeDate(new Date(item.start), true)}
            </StyledText>
            <StyledText verySmall color={date.id === item.id ? "#FFFFFF" : colors.text}>
              Cierre: {changeDate(new Date(item.end), true)}
            </StyledText>
          </StyledButton>
        )}
      />
      <View style={styles.row}>
        <FilterButton
          name="Todos"
          selected={date.id === "All"}
          onPress={() => setDate({ type: Type.All, start: null, end: null, id: "All" })}
        />
        <FilterButton
          name="Día"
          selected={date.id === "Day"}
          onPress={() => {
            setDate({
              id: "Day",
              type: Type.Date,
              start: moment(Date.now()).startOf("day").valueOf(),
              end: moment(Date.now()).endOf("day").valueOf(),
            });
          }}
        />
        <FilterButton
          name="Semana"
          selected={date.id === "Week"}
          onPress={() => {
            setDate({
              id: "Week",
              type: Type.Period,
              start: moment(Date.now()).startOf("day").subtract(1, "weeks").valueOf(),
              end: moment(Date.now()).endOf("day").valueOf(),
            });
          }}
        />
        <FilterButton
          name="Mes"
          selected={date.id === "Month"}
          onPress={() => {
            setDate({
              id: "Month",
              type: Type.Period,
              start: moment(Date.now()).startOf("day").subtract(1, "months").valueOf(),
              end: moment(Date.now()).endOf("day").valueOf(),
            });
          }}
        />
        <FilterButton
          name="Año"
          selected={date.id === "Year"}
          onPress={() => {
            setDate({
              id: "Year",
              type: Type.Period,
              start: moment(Date.now()).endOf("day").subtract(1, "years").valueOf(),
              end: moment(Date.now()).startOf("day").valueOf(),
            });
          }}
        />
        <FilterButton
          name="Período"
          selected={date.id === "Period"}
          onPress={() => setMultipleCalendarModal(true)}
        />
      </View>
      <SimpleCalendarModal
        defaultValue={date.start}
        visible={simpleCalendarModal}
        maxDate={moment().format("YYYY-MM-DD")}
        onClose={() => setSimpleCalendarModal(false)}
        onSave={(date) => {
          setDate({
            id: null,
            type: Type.Date,
            start: moment(date).startOf("day").valueOf(),
            end: moment(date).endOf("day").valueOf(),
          });
        }}
      />
      <MultipleCalendarModal
        visible={multipleCalendarModal}
        maxDate={moment().format("YYYY-MM-DD")}
        onClose={() => setMultipleCalendarModal(false)}
        onSave={({ start, end }) => {
          setDate({ id: "Period", type: Type.Period, start, end });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: { width: "auto", paddingHorizontal: 12, paddingVertical: 5 },
});

export default FullFilterDate;
