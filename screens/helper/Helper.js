import { View, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from '@react-navigation/native';
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();

const GroupScreen = () => {
  const mode = useSelector((state) => state.mode);
  const helpers = useSelector((state) => state.helpers);

  const navigation = useNavigation();

  return (
    <Layout
      style={{
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
          style={{ marginTop: 18 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
          smallParagraph
          justify
        >
          Puedes trabajar junto a un equipo de administración notificando en
          tiempo real los cambios hechos en la VBELA
        </TextStyle>
      </View>
      <View style={{ marginVertical: 30 }}>
        <ButtonStyle
          onPress={() => navigation.navigate("CreateHelper", { data: "Session" })}
          backgroundColor={light.main2}
        >
          <TextStyle center>Ingresar</TextStyle>
        </ButtonStyle>
        <ButtonStyle
          onPress={() => navigation.navigate("CreateHelper", { data: "Create" })}
          backgroundColor={mode === "dark" ? dark.main2 : light.main5}
        >
          <TextStyle center color={mode === "dark" ? light.main4 : light.textDark}>
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
              navigation.navigate("CreateHelper", { data: "Edit", item })
            }
          >
            <TextStyle center>{item.user}</TextStyle>
          </ButtonStyle>
        )}
      />
    </Layout>
  );
};

export default GroupScreen;