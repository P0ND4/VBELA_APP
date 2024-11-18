import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Country } from "domain/entities/shared/Country";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import FlagButton from "presentation/components/button/FlagButton";
import PhoneNumberPicker from "presentation/components/forms/PhoneNumberPicker";
import countries from "shared/data/countries.json";

import * as localization from "expo-localization";

type Disable = {
  switchAgency?: boolean;
  switchContact?: boolean;
};

type CreationFormProps = {
  onChageSwitchAgency?: (value: boolean) => void;
  disable?: Disable;
};

const CreationForm: React.FC<CreationFormProps> = ({ onChageSwitchAgency, disable }) => {
  const { colors } = useTheme();

  const [optional, setOptional] = useState(false);
  const [countrySelectionVisibleModal, setCountrySelectionVisibleModal] = useState<boolean>(false);
  const [countrySelection, setCountrySelection] = useState<Country>({
    country_name: "Estados Unidos",
    country_short_name: "US",
    country_phone_code: 1,
  });
  const [isAgency, setAgency] = useState<boolean>(false);

  useEffect(() => {
    const regionCode = localization.getLocales()[0].regionCode;
    const found = countries.find((c) => c.country_short_name === regionCode);
    if (found) setCountrySelection(found);
  }, []);

  return (
    <>
      <Layout>
        <View style={styles.pictureContainer}>
          <TouchableOpacity style={[styles.picture, { backgroundColor: colors.card }]}>
            <Ionicons name="image-outline" size={35} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.contactContainer}>
            <TouchableOpacity>
              <Ionicons name="call-outline" size={35} color={colors.text} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Ionicons name="logo-whatsapp" size={35} color={colors.primary} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          {!disable?.switchAgency && (
            <View style={[styles.row, { marginVertical: 6 }]}>
              <StyledText>Agencia de viajes</StyledText>
              <Switch
                value={isAgency}
                onChange={() => {
                  const value = !isAgency;
                  setAgency(value);
                  onChageSwitchAgency && onChageSwitchAgency(value);
                }}
                thumbColor={isAgency ? colors.primary : colors.card}
              />
            </View>
          )}
          <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <StyledInput placeholder="Nombre" />
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
                />
              </View>
              {isAgency && (
                <StyledButton style={styles.row}>
                  <StyledText>Número de personas</StyledText>
                  <Ionicons name="chevron-forward" color={colors.text} size={19} />
                </StyledButton>
              )}
              <StyledButton style={styles.row}>
                <StyledText>Dirección</StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <StyledInput placeholder="Complemento" />
              <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
                <StyledText>Opcionales</StyledText>
                <Ionicons name={optional ? "caret-up" : "caret-down"} />
              </StyledButton>
              {optional && (
                <>
                  <StyledInput placeholder="Email" />
                  <View style={{ flexDirection: "row" }}>
                    <FlagButton
                      onPress={() => setCountrySelectionVisibleModal(true)}
                      activate={countrySelectionVisibleModal}
                      country={countrySelection}
                    />
                    <StyledInput
                      keyboardType="numeric"
                      maxLength={20}
                      placeholder="Número segundario"
                    />
                  </View>
                  <StyledInput placeholder="N° ID" />
                  <StyledButton style={styles.row}>
                    <StyledText>Observación</StyledText>
                    <Ionicons name="chevron-forward" color={colors.text} size={19} />
                  </StyledButton>
                  {!disable?.switchContact && (
                    <View style={[styles.row, { marginTop: 12 }]}>
                      <StyledText>Registrar en los contactos del celular</StyledText>
                      <Switch />
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
          <View>
            <View style={[styles.row, { marginVertical: 12 }]}>
              <StyledText>Permitir ventas a crédito</StyledText>
              <Switch />
            </View>
            <StyledButton backgroundColor={colors.primary}>
              <StyledText center color="#FFFFFF">
                Guardar
              </StyledText>
            </StyledButton>
          </View>
        </View>
      </Layout>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  pictureContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  picture: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  icon: {
    marginHorizontal: 2,
  },
});

export default CreationForm;
