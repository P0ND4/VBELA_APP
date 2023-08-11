import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
import { remove } from "@features/tables/informationSlice";
import { removeTable } from "@api";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";
import { removeMany } from "@features/tables/ordersSlice";

const dark = theme.colors.dark;
const light = theme.colors.light;

const TableInformation = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const activeGroup = useSelector((state) => state.activeGroup);
  const tableState = useSelector((state) => state.tables);
  const orsState = useSelector((state) => state.orders);

  const [table, setTable] = useState(null);
  const [ors, setOrs] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);

  useEffect(() => {
    setTable(tableState.find((table) => table.id === route.params.id));
    setOrs(orsState);
  }, [tableState, orsState]);

  useEffect(() => {
    let amount = 0;

    const ordersFilter = ors.filter((o) => o.ref === route.params.id);

    for (let order of ordersFilter) {
      amount += order?.selection?.reduce((a, b) => a + b.total, 0);
    }

    setTotalMoney(thousandsSystem(amount));
  }, [ors]);

  useEffect(() => {
    navigation.setOptions({ title: table?.name ? table?.name : table?.table });
  }, [table]);

  const dispatch = useDispatch();

  return (
    <Layout
      style={{
        marginTop: 0,
        justifyContent: "center",
        alignItem: "center",
        padding: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextStyle
          smallTitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Mesa{" "}
          <TextStyle color={light.main2} smallTitle>
            {table?.table}
          </TextStyle>
        </TextStyle>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CreateTable", { item: table, editing: true })
          }
        >
          <Ionicons name="create-outline" size={38} color={light.main2} />
        </TouchableOpacity>
      </View>
      {table?.description && (
        <View style={{ marginTop: 14 }}>
          {table?.description && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {table?.description}
            </TextStyle>
          )}
        </View>
      )}
      <View style={{ marginVertical: 30 }}>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Dinero recolectado:{" "}
          <TextStyle color={light.main2}>{totalMoney}</TextStyle>
        </TextStyle>
      </View>
      <ButtonStyle
        backgroundColor={light.main2}
        onPress={() => {
          Alert.alert(
            "¿Estás seguro?",
            "Se eliminarán todos los datos de esta mesa",
            [
              {
                text: "No estoy seguro",
                style: "cancel",
              },
              {
                text: "Estoy seguro",
                onPress: async () => {
                  dispatch(remove({ id: route.params.id }));
                  dispatch(removeMany({ ref: route.params.id }));
                  navigation.pop();
                  await removeTable({
                    email: activeGroup.active ? activeGroup.email : user.email,
                    id: route.params.id,
                    groups: activeGroup.active
                      ? [activeGroup.id]
                      : user.helpers.map((h) => h.id),
                  });
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <TextStyle center>Eliminar mesa</TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

export default TableInformation;
