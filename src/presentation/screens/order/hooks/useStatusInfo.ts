import { useMemo } from "react";
import { Status } from "domain/enums/data/element/status.enums";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface StatusInfo {
  color: string;
  icon: IoniconsName;
  lineThrough: boolean;
}

export const useStatusInfo = (status: Status): StatusInfo => {
  const { colors } = useTheme();

  const statusMap: Record<Status, StatusInfo> = {
    [Status.Pending]: { color: colors.text, icon: "time-outline", lineThrough: false },
    [Status.Standby]: { color: colors.text, icon: "timer-outline", lineThrough: false },
    [Status.Confirmed]: { color: colors.primary, icon: "time", lineThrough: false },
    [Status.Completed]: { color: colors.primary, icon: "checkmark-circle", lineThrough: false },
    [Status.Canceled]: { color: "#f71010", icon: "remove-circle-outline", lineThrough: true },
  };

  return useMemo(
    () => statusMap[status] || { color: colors.text, icon: "help", lineThrough: false },
    [status],
  );
};
