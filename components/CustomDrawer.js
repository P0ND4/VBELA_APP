import { editUser } from "@api";
import Background from "@assets/background.png";
import Logo from "@assets/logo.png";
import TextStyle from "@components/TextStyle";
import cleanData from "@helpers/cleanData";
import helperCameOut from "@helpers/helperCameOut";
import language from "@language";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { socket } from "@socket";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { readFile } from "../helpers/offline";

import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CustomDrawer = (props) => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const activeGroup = useSelector((state) => state.activeGroup);
  const helpers = useSelector((state) => state.helpers);

  const [translate, setTranslate] = useState({});
  const [isItInSync, setIsItSync] = useState(null);

  useEffect(() => {
    const code = "es";
    setTranslate(language[code]["home"]);
  }, []);

  useEffect(() => {
    (async () => {
      const data = await readFile({ name: "data.json" });
      setIsItSync(!!data.error);
    })();
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const shareApp = async () => {
    try {
      const message = `Descarga VBELA, la app para gestionar alquileres, restaurantes y ventas. Descárgala en la Play Store https://play.google.com/store/apps/details?id=com.app.vbela. ¡Controla tu negocio ahora!`;
      await Share.share({ message });
    } catch (e) {
      console.log(e.message);
    }
  };

  const logOut = () => {
    navigation.replace("SignIn");
    setTimeout(async () => {
      const active = activeGroup;
      if (helpers.length > 0) {
        const helpers = helpers?.map((helper) => ({
          ...helper,
          expoID: helper.expoID.filter((e) => e !== user.expoID),
        }));

        await editUser({ email: user.email, change: { helpers } });
      }
      const groups = helpers?.map((h) => h.id);
      if (groups.length > 0) socket.emit("leave", { groups });
      cleanData(dispatch);
      if (active.active) {
        socket.emit("leave", { groups: [active.id] });
        await helperCameOut(active, user);
      }
    }, 300);
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "#00D1FF" }}
        style={{ backgroundColor: mode === "light" ? light.main4 : dark.main1 }}
      >
        <ImageBackground source={Background} style={styles.imageBackground}>
          <Image
            source={Logo}
            style={{
              height: 80,
              width: 80,
              borderRadius: 40,
              marginBottom: 10,
            }}
          />
          <TextStyle smallParagraph color="#FFFFFF">
            {user?.email}
          </TextStyle>
          <TextStyle verySmall color="#FFFFFF">
            {isItInSync ? 'Sincronizado' : 'No Sincronizado'}
          </TextStyle>
        </ImageBackground>
        <View
          style={{
            flex: 1,
            backgroundColor: mode === "light" ? light.main4 : dark.main1,
            paddingTop: 10,
          }}
        >
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#CCC",
          backgroundColor: mode === "light" ? light.main4 : dark.main1,
        }}
      >
        <TouchableOpacity
          onPress={() => shareApp()}
          style={{
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="share-social-outline"
            size={22}
            color={mode === "dark" ? dark.textWhite : light.textDark}
          />
          <TextStyle
            smallParagraph
            customStyle={{ fontFamily: "Roboto-Medium", marginLeft: 5 }}
            color={mode === "dark" ? dark.textWhite : light.textDark}
          >
            Compartir
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              translate.signOut.title,
              translate.signOut.description,
              [
                {
                  text: translate.negation,
                  style: "cancel",
                },
                {
                  text: translate.affirmation,
                  onPress: () => logOut(),
                },
              ],
              { cancelable: true }
            );
          }}
          style={{
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="exit-outline"
            size={22}
            color={mode === "dark" ? dark.textWhite : light.textDark}
          />
          <TextStyle
            smallParagraph
            customStyle={{ fontFamily: "Roboto-Medium", marginLeft: 5 }}
            color={mode === "dark" ? dark.textWhite : light.textDark}
          >
            Cerrar sesión
          </TextStyle>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CustomDrawer;
