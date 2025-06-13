import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Country } from "domain/entities/shared/Country";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { change } from "application/slice/settings/invoice.information.slice";
import apiClient from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import FlagButton from "presentation/components/button/FlagButton";
import PhoneNumberPicker from "presentation/components/forms/PhoneNumberPicker";
import countries from "shared/data/countries.json";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import endpoints from "config/constants/api.endpoints";

const Invoice = () => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const invoiceInformation = useAppSelector((state) => state.invoiceInformation);

  const [company, setCompany] = useState<string>(invoiceInformation.company);
  const [business, setBusiness] = useState<string>(invoiceInformation.business);
  const [address, setAddress] = useState<string>(invoiceInformation.address);
  const [identification, setIdentification] = useState<string>(invoiceInformation.identification);
  const [phoneNumber, setPhoneNumber] = useState<string>(invoiceInformation.phoneNumber);
  const [complement, setComplement] = useState<string>(invoiceInformation.complement);

  const [countrySelectionVisibleModal, setCountrySelectionVisibleModal] = useState<boolean>(false);
  const [countrySelection, setCountrySelection] = useState<Country>({
    country_name: "Estados Unidos",
    country_short_name: "US",
    country_phone_code: 1,
  });

  const [addressModal, setAddressModal] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const found = countries.find((c) => c.country_phone_code === invoiceInformation.countryCode);
    if (found) setCountrySelection(found);
  }, [invoiceInformation]);

  const changeInvoice = async () => {
    const data = {
      company,
      business,
      address,
      identification,
      countryCode: countrySelection.country_phone_code,
      phoneNumber,
      complement,
    };
    dispatch(change(data));
    Alert.alert("Guardado", "Se ha guardado la información satisfactoriamente.");
    await apiClient({
      url: endpoints.setting.invoiceInformation(),
      method: "PATCH",
      data,
    });
    emit("accessToRestaurant");
    emit("accessToStore");
  };

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View>
          <StyledInput
            placeholder="Nombre de la empresa"
            maxLength={30}
            value={company}
            onChangeText={(text) => setCompany(text)}
          />
          <StyledInput
            placeholder="Nombre del negoció"
            maxLength={30}
            value={business}
            onChangeText={(text) => setBusiness(text)}
          />
          <StyledButton style={styles.row} onPress={() => setAddressModal(true)}>
            <StyledText>Dirección {address ? `(${address.slice(0, 22)})` : ""}</StyledText>
            <Ionicons name="chevron-forward" color={colors.text} size={19} />
          </StyledButton>
          <StyledInput
            placeholder="Número de identificación"
            value={identification}
            maxLength={30}
            onChangeText={(text) => setIdentification(text)}
          />
          <View style={{ flexDirection: "row" }}>
            <FlagButton
              onPress={() => setCountrySelectionVisibleModal(true)}
              activate={countrySelectionVisibleModal}
              country={countrySelection}
            />
            <StyledInput
              keyboardType="numeric"
              maxLength={20}
              placeholder="Teléfono/WhatsApp"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
            />
          </View>
          <StyledInput
            placeholder="Complemento"
            value={complement}
            maxLength={30}
            onChangeText={(text) => setComplement(text)}
          />
        </View>
        <StyledButton backgroundColor={colors.primary} onPress={changeInvoice}>
          <StyledText color="#FFFFFF" center>
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
      <InputScreenModal
        defaultValue={address}
        title="Dirección"
        placeholder="¿En qué dirección se encuentra el local?"
        visible={addressModal}
        maxLength={150}
        onClose={() => setAddressModal(false)}
        onSubmit={(address) => setAddress(address)}
      />
      <PhoneNumberPicker
        modalVisible={countrySelectionVisibleModal}
        setModalVisible={setCountrySelectionVisibleModal}
        onChange={(item) => setCountrySelection(item)}
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
});

export default Invoice;
