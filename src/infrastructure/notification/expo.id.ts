import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export const getExpoID = async (): Promise<string | undefined> => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#EEEEEE",
      });
    }

    if (!Device.isDevice) {
      alert("Debe usar un dispositivo físico para las notificaciones automáticas");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Hubo un error al obtener el token de la push notifications!");
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: "0dd838a6-95db-4883-9a7f-7e6112496cd0",
    });

    console.log(token);
    return token;
  } catch (error) {
    console.error("Error al obtener el token de notificaciones: ", error);
  }
};
