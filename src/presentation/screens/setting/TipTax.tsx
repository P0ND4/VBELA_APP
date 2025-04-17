import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { change as changeTip } from "application/slice/settings/tip.slice";
import { change as changeTax } from "application/slice/settings/tax.slice";
import apiClient, { endpoints } from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import CountScreenModal from "presentation/components/modal/CountScreenModal";

const TipTax = () => {
  const { colors } = useTheme();

  const tip = useAppSelector((state) => state.tip);
  const tax = useAppSelector((state) => state.tax);

  const [tipValue, setTipValue] = useState<number>(0);
  const [taxValue, setTaxValue] = useState<number>(0);

  const [tipModal, setTipModal] = useState<boolean>(false);
  const [taxModal, setTaxModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const onChangeTip = async (tipValue: number) => {
    dispatch(changeTip(tipValue / 100));
    await apiClient({
      url: endpoints.setting.tip(),
      method: "PATCH",
      data: { tip: tipValue / 100 },
    });
  };

  const onChangeTax = async (taxValue: number) => {
    dispatch(changeTax(taxValue / 100));
    await apiClient({
      url: endpoints.setting.tax(),
      method: "PATCH",
      data: { tax: taxValue / 100 },
    });
  };

  useEffect(() => {
    setTipValue(tip * 100);
  }, [tip]);

  useEffect(() => {
    setTaxValue(tax * 100);
  }, [tax]);

  return (
    <>
      <Layout>
        <StyledButton style={styles.row} onPress={() => setTipModal(true)}>
          <StyledText>Propina {!!tipValue && `(${thousandsSystem(tipValue)}%)`}</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
        <StyledButton style={styles.row} onPress={() => setTaxModal(true)}>
          <StyledText>Impuestos {!!taxValue && `(${thousandsSystem(taxValue)}%)`}</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
      </Layout>
      <CountScreenModal
        title="Propina"
        increasers={true}
        description={() => "Defina el porcentaje de propina por defecto para pedidos"}
        visible={tipModal}
        defaultValue={tipValue}
        isRemove={!!tipValue}
        maxValue={100}
        onClose={() => setTipModal(false)}
        onSave={onChangeTip}
      />
      <CountScreenModal
        title="Impuesto"
        increasers={true}
        description={() => "Defina el porcentaje de impuesto por defecto para pedidos"}
        visible={taxModal}
        defaultValue={taxValue}
        isRemove={!!taxValue}
        maxValue={100}
        onClose={() => setTaxModal(false)}
        onSave={onChangeTax}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default TipTax;
