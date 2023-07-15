import { View, FlatList } from "react-native";
import { useSelector } from "react-redux";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const GroupScreen = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const helpers = useSelector((state) => state.helpers);

  return (
    <Layout
      style={{
        marginTop: 0,
        justifyContent: "center",
        alignItem: "center",
        padding: 30,
      }}
    >
      <View>
        <TextStyle title color={light.main2}>
          Grupos
        </TextStyle>
        <TextStyle
          customStyle={{ marginTop: 18 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Puedes trabajar junto a un equipo de administración notificando en
          tiempo real los cambios hechos en la VBELA
        </TextStyle>
      </View>
      <View style={{ marginVertical: 30 }}>
        <ButtonStyle
          onPress={() => navigation.push("CreateHelper", { data: "Session" })}
          backgroundColor={light.main2}
        >
          <TextStyle>Ingresar</TextStyle>
        </ButtonStyle>
        <ButtonStyle
          onPress={() => navigation.push("CreateHelper", { data: "Create" })}
          backgroundColor={mode === "dark" ? dark.main2 : light.main5}
        >
          <TextStyle color={mode === "dark" ? light.main4 : light.textDark}>
            Crear
          </TextStyle>
        </ButtonStyle>
      </View>
      <FlatList
        data={helpers}
        renderItem={({ item }) => (
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() =>
              navigation.push("CreateHelper", { data: "Edit", item })
            }
          >
            {item.user}
          </ButtonStyle>
        )}
      />
    </Layout>
  );
};

export default GroupScreen;