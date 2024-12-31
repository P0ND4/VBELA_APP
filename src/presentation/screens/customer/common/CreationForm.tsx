import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@react-navigation/native";
import { Country } from "domain/entities/shared/Country";
import { Customer } from "domain/entities/data/customers";
import { random, thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import FlagButton from "presentation/components/button/FlagButton";
import PhoneNumberPicker from "presentation/components/forms/PhoneNumberPicker";
import countries from "shared/data/countries.json";
import InputScreenModal from "presentation/components/modal/InputScreenModal";
import CountScreenModal from "presentation/components/modal/CountScreenModal";

import * as localization from "expo-localization";

const FlagButtonAndPhoneNumberPicker: React.FC<{ onChange: (contryCode: number) => void }> = ({
  onChange,
}) => {
  const [countrySelectionVisibleModal, setCountrySelectionVisibleModal] = useState<boolean>(false);
  const [countrySelection, setCountrySelection] = useState<Country>({
    country_name: "Estados Unidos",
    country_short_name: "US",
    country_phone_code: 1,
  });

  useEffect(() => {
    const regionCode = localization.getLocales()[0].regionCode;
    const found = countries.find((c) => c.country_short_name === regionCode);
    if (found) setCountrySelection(found);
  }, []);

  return (
    <>
      <FlagButton
        onPress={() => setCountrySelectionVisibleModal(true)}
        activate={countrySelectionVisibleModal}
        country={countrySelection}
      />
      <PhoneNumberPicker
        modalVisible={countrySelectionVisibleModal}
        setModalVisible={setCountrySelectionVisibleModal}
        onChange={(item) => {
          setCountrySelection(item);
          onChange(item.country_phone_code);
        }}
      />
    </>
  );
};

type Disable = {
  switchAgency?: boolean;
  switchContact?: boolean;
};

type CreationFormProps = {
  disable?: Disable;
  defaultValue?: Customer;
  onSubmit: (data: Customer) => void;
};

const CreationForm: React.FC<CreationFormProps> = ({ disable, defaultValue, onSubmit }) => {
  const { control, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      agency: defaultValue?.agency || false,
      name: defaultValue?.name || "",
      firstCountryCode: defaultValue?.firstCountryCode || 1,
      firstPhoneNumber: defaultValue?.firstPhoneNumber || "",
      address: defaultValue?.address || "",
      complement: defaultValue?.complement || "",
      email: defaultValue?.email || "",
      people: defaultValue?.people || 0,
      secondCountryCode: defaultValue?.secondCountryCode || 1,
      secondPhoneNumber: defaultValue?.secondPhoneNumber || "",
      account: defaultValue?.account || [],
      total: defaultValue?.total || 0,
      identification: defaultValue?.identification || "",
      observation: defaultValue?.observation || "",
      credit: defaultValue?.credit || false,
      creationDate: defaultValue?.creationDate || new Date().getTime(),
      modificationDate: new Date().getTime(),
    },
  });

  const { colors } = useTheme();

  const { agency, firstPhoneNumber, observation, address, people } = watch();

  const [optional, setOptional] = useState(false);
  const [observationModal, setObservationModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [countModal, setCountModal] = useState(false);

  return (
    <>
      <Layout>
        <View style={styles.pictureContainer}>
          <TouchableOpacity style={[styles.picture, { backgroundColor: colors.card }]}>
            <Ionicons name="image-outline" size={35} color={colors.text} />
          </TouchableOpacity>
          {/* {firstPhoneNumber && (
            <View style={styles.contactContainer}>
              <TouchableOpacity>
                <Ionicons name="call-outline" size={35} color={colors.text} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 15 }}>
                <Ionicons
                  name="logo-whatsapp"
                  size={35}
                  color={colors.primary}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          )} */}
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          {!disable?.switchAgency && (
            <Controller
              name="agency"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View style={[styles.row, { marginVertical: 6 }]}>
                  <StyledText>Agencia de viajes</StyledText>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    thumbColor={value ? colors.primary : colors.card}
                  />
                </View>
              )}
            />
          )}
          <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="Nombre"
                    maxLength={30}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {formState.errors.name && (
                <StyledText color={colors.primary} verySmall>
                  El nombre es requerido
                </StyledText>
              )}
              <View style={{ flexDirection: "row" }}>
                <FlagButtonAndPhoneNumberPicker
                  onChange={(countryCode) => setValue("firstCountryCode", countryCode)}
                />
                <Controller
                  name="firstPhoneNumber"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <StyledInput
                      keyboardType="numeric"
                      maxLength={20}
                      placeholder="Teléfono/WhatsApp"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                />
              </View>
              {agency && (
                <>
                  <StyledButton style={styles.row} onPress={() => setCountModal(true)}>
                    <StyledText>
                      {people
                        ? `Hay ${thousandsSystem(people)} personas registradas`
                        : "Número de personas"}
                    </StyledText>
                    <Ionicons name="chevron-forward" color={colors.text} size={19} />
                  </StyledButton>
                  {formState.errors.people && (
                    <StyledText color={colors.primary} verySmall>
                      La cantidad de personas para la agencia es requerido
                    </StyledText>
                  )}
                </>
              )}

              <StyledButton style={styles.row} onPress={() => setAddressModal(true)}>
                <StyledText>
                  {address
                    ? `Dirección agregada (${thousandsSystem(address.length)})`
                    : "Dirección"}
                </StyledText>
                <Ionicons name="chevron-forward" color={colors.text} size={19} />
              </StyledButton>
              <Controller
                name="complement"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="Complemento"
                    maxLength={50}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
                <StyledText>Opcionales</StyledText>
                <Ionicons name={optional ? "caret-up" : "caret-down"} />
              </StyledButton>
              {optional && (
                <>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <StyledInput
                        placeholder="Email"
                        maxLength={50}
                        keyboardType="email-address"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />
                  <View style={{ flexDirection: "row" }}>
                    <FlagButtonAndPhoneNumberPicker
                      onChange={(countryCode) => setValue("secondCountryCode", countryCode)}
                    />
                    <Controller
                      name="secondPhoneNumber"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          keyboardType="numeric"
                          maxLength={20}
                          placeholder="Número segundario"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  <Controller
                    name="identification"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <StyledInput
                        placeholder="N° ID"
                        maxLength={50}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />
                  <StyledButton style={styles.row} onPress={() => setObservationModal(true)}>
                    <StyledText>
                      {observation
                        ? `Observación agregada (${thousandsSystem(observation.length)})`
                        : "Observación"}
                    </StyledText>
                    <Ionicons name="chevron-forward" color={colors.text} size={19} />
                  </StyledButton>
                  {/* {!disable?.switchContact && (
                    <View style={[styles.row, { marginTop: 12 }]}>
                      <StyledText>Registrar en los contactos del celular</StyledText>
                      <Switch />
                    </View>
                  )} */}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
          <View>
            <Controller
              name="credit"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View style={[styles.row, { marginVertical: 12 }]}>
                  <StyledText>Permitir ventas a crédito</StyledText>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    thumbColor={value ? colors.primary : colors.card}
                  />
                </View>
              )}
            />

            <StyledButton backgroundColor={colors.primary} onPress={handleSubmit(onSubmit)}>
              <StyledText center color="#FFFFFF">
                Guardar
              </StyledText>
            </StyledButton>
          </View>
        </View>
      </Layout>
      <Controller
        name="address"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InputScreenModal
            defaultValue={value}
            title="Dirección"
            placeholder="¿Dónde se encuentra ubicado el cliente o agencia?"
            visible={addressModal}
            maxLength={3000}
            onClose={() => setAddressModal(false)}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="observation"
        control={control}
        render={({ field: { onChange, value } }) => (
          <InputScreenModal
            defaultValue={value}
            title="Observación"
            placeholder="¿Qué observaciones quiere hacer al cliente o agencia?"
            visible={observationModal}
            maxLength={1000}
            onClose={() => setObservationModal(false)}
            onSubmit={onChange}
          />
        )}
      />
      <Controller
        name="people"
        control={control}
        rules={{
          validate: (value: number) => {
            if (!agency) return true;
            return value > 0 || "La cantidad de personas para la agencia es requerido";
          },
        }}
        render={({ field: { onChange, value } }) => (
          <CountScreenModal
            title="Personas"
            description={(count) =>
              count
                ? `Hay ${thousandsSystem(count)} personas en la agencia`
                : "¿Cuántas personas están en la agencia?"
            }
            visible={countModal}
            defaultValue={value}
            isRemove
            maxValue={100}
            onClose={() => setCountModal(false)}
            onSave={onChange}
          />
        )}
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
