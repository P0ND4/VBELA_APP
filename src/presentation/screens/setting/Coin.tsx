import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import { change } from "application/slice/settings/coin.slice";
import apiClient, { endpoints } from "infrastructure/api/server";

type CardProps = {
  name: string;
  onPress: () => void;
};

const Card: React.FC<CardProps> = React.memo(({ name, onPress }) => {
  const coin = useAppSelector((state) => state.coin);

  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { borderColor: colors.border }]} onPress={onPress}>
      <StyledText>{name}</StyledText>
      {coin === name && <Ionicons name="checkmark" size={30} color={colors.primary} />}
    </TouchableOpacity>
  );
});

const Coin = () => {
  const { colors } = useTheme();

  const dispatch = useAppDispatch();

  const coins = [
    "USD",
    "EUR",
    "JPY",
    "GBP",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "HKD",
    "NZD",
    "SEK",
    "KRW",
    "SGD",
    "NOK",
    "MXN",
    "INR",
    "RUB",
    "ZAR",
    "TRY",
    "BRL",
    "TWD",
    "DKK",
    "PLN",
    "THB",
    "IDR",
    "HUF",
    "CZK",
    "ILS",
    "CLP",
    "PHP",
    "AED",
    "COP",
    "SAR",
    "MYR",
    "RON",
    "ARS",
    "PKR",
    "EGP",
    "IQD",
    "NGN",
    "MAD",
    "VEF",
    "VND",
    "BDT",
    "UAH",
    "KZT",
    "IRR",
    "DZD",
    "QAR",
    "OMR",
    "LKR",
    "KWD",
    "KES",
    "SDG",
    "TZS",
    "UGX",
    "LBP",
    "JOD",
    "BHD",
    "YER",
    "BND",
    "PEN",
    "GHS",
    "XOF",
    "XAF",
    "XCD",
    "XPF",
    "SRD",
    "GYD",
    "BBD",
    "TTD",
    "NAD",
    "NIO",
    "HTG",
    "JMD",
    "KYD",
    "AWG",
    "BZD",
    "ANG",
    "BMD",
    "BSD",
    "BWP",
    "SBD",
    "WST",
    "FJD",
    "PGK",
    "MGA",
    "MUR",
    "SCR",
    "MVR",
    "ZMW",
    "BIF",
    "CDF",
    "RWF",
    "UGX",
    "SSP",
    "GNF",
    "SLL",
    "CVE",
    "SZL",
    "LSL",
    "MZN",
    "AOA",
    "MWK",
    "ETB",
    "TND",
    "LBP",
    "SDG",
    "DJF",
    "KMF",
    "STD",
    "SHP",
    "GIP",
    "FKP",
    "IMP",
    "JEP",
    "ANG",
    "BMD",
    "GGP",
    "CUC",
    "BTN",
    "MNT",
    "AFN",
    "KPW",
    "BYN",
    "LAK",
    "MMK",
    "KHR",
    "NPR",
    "MOP",
    "VUV",
    "TOP",
    "SVC",
    "SOS",
    "SZL",
    "ZWL",
  ];

  const [data, setData] = useState<string[]>(coins);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (search) {
      const filtered = coins.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
      setData(filtered);
    } else setData(coins);
  }, [search]);

  const changeCoin = async (coin: string) => {
    dispatch(change(coin));
    await apiClient({
      url: endpoints.setting.coin(),
      method: "PATCH",
      data: { coin },
    });
  };

  return (
    <Layout style={{ padding: 0 }}>
      <StyledInput
        placeholder="Busca por nombre"
        stylesContainer={{ marginVertical: 0, borderRadius: 0 }}
        stylesInput={{ paddingVertical: 15 }}
        left={() => <Ionicons name="search" size={25} color={colors.text} />}
        onChangeText={setSearch}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Card name={item} onPress={() => changeCoin(item)} />}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 70,
          offset: 70 * index,
          index,
        })}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    height: 70,
    borderBottomWidth: 1,
  },
});

export default Coin;
