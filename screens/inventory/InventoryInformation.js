import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { thousandsSystem } from "@helpers/libs";
import theme from "@theme";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";

const dark = theme.colors.dark;
const light = theme.colors.light;

const InventoryInformation = () => {
  const mode = useSelector((state) => state.mode);
  const inventory = useSelector((state) => state.inventory);

  const [totalMoney, setTotalMoney] = useState(0);

  const sortValue = () => {
    return [...inventory].sort((a, b) => {
      return (
        a.output.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
        a.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
        (b.output.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
          b.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0))
      );
    });
  };

  const sortEntry = () => {
    return [...inventory].sort((a, b) => {
      return (
        b.entry.filter((e) => e.entry).reduce((a, b) => a + b.quantity, 0) -
        a.entry.filter((e) => e.entry).reduce((a, b) => a + b.quantity, 0)
      );
    });
  };

  const sortOutput = () => {
    return [...inventory].sort((a, b) => {
      return (
        b.output.reduce((a, b) => a + b.quantity, 0) -
        a.output.reduce((a, b) => a + b.quantity, 0)
      );
    });
  };

  const sortStock = () => {
    return [...inventory].sort((a, b) => {
      return (
        b.output.reduce((a, b) => a + b.quantity, 0) -
        a.entry.reduce((a, b) => a + b.quantity, 0) -
        (b.output.reduce((a, b) => a + b.quantity, 0) -
          b.entry.reduce((a, b) => a + b.quantity, 0))
      );
    });
  };

  useEffect(() => {
    setTotalMoney(
      inventory.reduce(
        (a, item) =>
          a +
          item.entry.reduce((a, b) => a + b.currentValue * b.quantity, 0) -
          item.output.reduce((a, b) => a + b.currentValue * b.quantity, 0),
        0
      )
    );
  }, [inventory]);

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
        <TextStyle color={light.main2} smallTitle>
          Inventario
        </TextStyle>
      </View>
      <View style={{ marginVertical: 30 }}>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Balance:{" "}
          <TextStyle color={totalMoney >= 0 ? light.main2 : "#F70000"}>
            {totalMoney >= 0 ? "POSITIVO (+)" : "NEGATIVO (-)"}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Valor total:{" "}
          <TextStyle color={totalMoney >= 0 ? light.main2 : "#F70000"}>
            {thousandsSystem(totalMoney)}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Mayor valor:{" "}
          <TextStyle color={totalMoney >= 0 ? light.main2 : "#F70000"}>
            {thousandsSystem(
              sortValue()[0].entry.reduce(
                (a, b) => a + b.currentValue * b.quantity,
                0
              ) -
                sortValue()[0].output.reduce(
                  (a, b) => a + b.currentValue * b.quantity,
                  0
                )
            )}{" "}
            ({sortValue()[0].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Menor valor:{" "}
          <TextStyle color={totalMoney >= 0 ? light.main2 : "#F70000"}>
            {thousandsSystem(
              sortValue()[sortValue().length - 1].entry.reduce(
                (a, b) => a + b.currentValue * b.quantity,
                0
              ) -
                sortValue()[sortValue().length - 1].output.reduce(
                  (a, b) => a + b.currentValue * b.quantity,
                  0
                )
            )}{" "}
            ({sortValue()[sortValue().length - 1].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Mayor entrada:{" "}
          <TextStyle color={light.main2}>
            {thousandsSystem(
              sortEntry()[0]
                .entry.filter((e) => e.entry)
                .reduce((a, b) => a + b.quantity, 0)
            )}{" "}
            ({sortEntry()[0].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Menor entrada:{" "}
          <TextStyle color={light.main2}>
            {thousandsSystem(
              sortEntry()
                [sortEntry().length - 1].entry.filter((e) => e.entry)
                .reduce((a, b) => a + b.quantity, 0)
            )}{" "}
            ({sortEntry()[sortEntry().length - 1].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Mayor salida:{" "}
          <TextStyle color="#F70000">
            {thousandsSystem(
              sortOutput()[0].output.reduce((a, b) => a + b.quantity, 0)
            )}{" "}
            ({sortOutput()[0].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Menor salida:{" "}
          <TextStyle color="#F70000">
            {thousandsSystem(
              sortOutput()[sortOutput().length - 1].output.reduce(
                (a, b) => a + b.quantity,
                0
              )
            )}{" "}
            ({sortEntry()[sortOutput().length - 1].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Mayor cantidad de stock:{" "}
          <TextStyle
            color={
              sortStock()[0].entry.reduce((a, b) => a + b.quantity, 0) -
                sortStock()[0].output.reduce((a, b) => a + b.quantity, 0) >=
              0
                ? light.main2
                : "#F70000"
            }
          >
            {thousandsSystem(
              sortStock()[0].entry.reduce((a, b) => a + b.quantity, 0) -
                sortStock()[0].output.reduce((a, b) => a + b.quantity, 0)
            )}{" "}
            ({sortStock()[0].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Menor cantidad de stock:{" "}
          <TextStyle
            color={
              sortStock()[sortStock().length - 1].entry.reduce(
                (a, b) => a + b.quantity,
                0
              ) -
                sortStock()[sortStock().length - 1].output.reduce(
                  (a, b) => a + b.quantity,
                  0
                ) >=
              0
                ? light.main2
                : "#F70000"
            }
          >
            {thousandsSystem(
              sortStock()[sortStock().length - 1].entry.reduce(
                (a, b) => a + b.quantity,
                0
              ) -
                sortStock()[sortStock().length - 1].output.reduce(
                  (a, b) => a + b.quantity,
                  0
                )
            )}{" "}
            ({sortStock()[sortStock().length - 1].name.toUpperCase()})
          </TextStyle>
        </TextStyle>
      </View>
    </Layout>
  );
};

export default InventoryInformation;
