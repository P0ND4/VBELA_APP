import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Control, Controller, UseFormWatch } from "react-hook-form";
import { Element } from "domain/entities/data/common";
import { thousandsSystem } from "shared/utils";
import { useAppSelector } from "application/store/hook";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import PickerFloorModal from "presentation/components/modal/PickerFloorModal";

const GET_TAB_NAME = {
  [Visible.Restaurant]: "RECETAS",
  [Visible.Store]: "PAQUETES",
};

type ElementStockProps = {
  visible: Visible.Store | Visible.Restaurant;
  inventories: string[];
  control: Control<Element>;
  watch: UseFormWatch<Element>;
};

const ElementStock: React.FC<ElementStockProps> = ({ inventories, visible, control, watch }) => {
  const { colors } = useTheme();

  const stocks = useAppSelector((state) => state.stocks);
  const recipes = useAppSelector((state) => state.recipes);

  const [minimunStockModal, setMinimunStockModal] = useState<boolean>(false);
  const [stockCountModal, setStockCountModal] = useState<boolean>(false);
  const [stockModal, setStockModal] = useState<boolean>(false);
  const [recipeModal, setRecipeModal] = useState<boolean>(false);

  const [stocksData, setStocksData] = useState<{ label: string; value: string }[]>([]);
  const [recipesData, setRecipesData] = useState<{ label: string; value: string }[]>([]);

  const { stock, minStock, stockIDS, packageIDS, activeStock, unit } = watch();

  useEffect(() => {
    const found = stocks.filter((s) => inventories.includes(s.inventoryID) && s.visible);
    const stocksData = found.map((s) => {
      const label = `${s.name} ${s.unit && `(${s.unit})`}`;
      return { label, value: s.id };
    });
    setStocksData(stocksData);
  }, [stocks, inventories]);

  useEffect(() => {
    const found = recipes.filter((r) => inventories.includes(r.inventoryID) && r.visible);
    const recipesData = found.map((r) => ({ label: r.name, value: r.id }));
    setRecipesData(recipesData);
  }, [recipes, inventories]);

  return (
    <>
      <Layout>
        <Controller
          name="activeStock"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={styles.row}>
              <View>
                <StyledText>Activar manejo por STOCK</StyledText>
                <StyledText verySmall color={colors.primary}>
                  Se activaran todos los tipos de stocks disponibles.
                </StyledText>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                thumbColor={value ? colors.primary : colors.card}
              />
            </View>
          )}
        />
        <View style={[styles.stock, { opacity: activeStock ? 1 : 0.6 }]}>
          <StyledText smallSubtitle style={{ marginBottom: 5 }}>
            Stock
          </StyledText>
          <TouchableOpacity
            style={{ borderBottomWidth: 1, borderColor: colors.border }}
            disabled={!activeStock}
            onPress={() => setStockCountModal(true)}
          >
            <StyledText bigTitle color={colors.primary}>
              {thousandsSystem(stock || 0)}
            </StyledText>
          </TouchableOpacity>
        </View>
        <View>
          <StyledButton
            style={[styles.row, { width: "auto" }]}
            disable={!activeStock}
            onPress={() => setRecipeModal(true)}
          >
            <StyledText>
              {!packageIDS?.length
                ? GET_TAB_NAME[visible]
                : `Hay (${thousandsSystem(packageIDS.length)}) ${GET_TAB_NAME[visible]} afiliados`}
            </StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          <StyledButton
            style={[styles.row, { width: "auto" }]}
            disable={!activeStock}
            onPress={() => setStockModal(true)}
          >
            <StyledText>
              {!stockIDS?.length
                ? "Stock en inventario"
                : `Hay (${thousandsSystem(stockIDS.length)}) stocks afiliados`}
            </StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          <StyledButton
            style={styles.row}
            disable={!activeStock}
            onPress={() => setMinimunStockModal(true)}
          >
            <StyledText>Stock mínimo: {thousandsSystem(minStock || 0)}</StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
        </View>
      </Layout>
      <Controller
        name="stock"
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Stock"
            decimal={unit === "UND" ? false : true}
            description={() => "Maneja el stock"}
            isRemove={!!value}
            maxValue={9999999}
            visible={stockCountModal}
            defaultValue={value}
            onClose={() => setStockCountModal(false)}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="minStock"
        control={control}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Stock mínimo"
            decimal={unit === "UND" ? false : true}
            description={() => "Maneja el stock mínimo o punto de reorden"}
            maxValue={9999999}
            isRemove={!!value}
            visible={minimunStockModal}
            defaultValue={value}
            onClose={() => setMinimunStockModal(false)}
            onSave={onChange}
          />
        )}
      />
      <Controller
        name="stockIDS"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            title="STOCK"
            noData="NO HAY STOCKS ENCONTRADOS"
            remove="Remover selección"
            visible={stockModal}
            onClose={() => setStockModal(false)}
            data={stocksData}
            multiple={value}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="packageIDS"
        control={control}
        render={({ field: { onChange, value } }) => (
          <PickerFloorModal
            title={GET_TAB_NAME[visible]}
            noData="NO HAY RECETAS ENCONTRADAS"
            remove="Remover selección"
            visible={recipeModal}
            onClose={() => setRecipeModal(false)}
            data={recipesData}
            multiple={value}
            onSubmit={onChange}
          />
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ElementStock;
