import React, { useState } from "react";
import { Switch, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Pad } from "presentation/screens/common/NumericPad";
import { Element } from "domain/entities/data/common/element.entity";
import { random, thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  locationID: string;
  onSave: (item: Element, register: boolean) => void;
};

const UnregisteredModal: React.FC<ModalProps> = ({ visible, onClose, onSave, locationID }) => {
  const { colors } = useTheme();

  const [value, setValue] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);

  const send = ({ name = "Sin nombre" }: { name?: string } = {}) => ({
    id: random(10),
    name,
    price: value,
    locationID,
    creationDate: new Date().toISOString(),
    modificationDate: new Date().toISOString(),
  });

  const clean = () => {
    setRegister(false);
    setName("");
    setValue(0);
  };

  return (
    <>
      <ScreenModal
        title="Vender ítem no registrado"
        visible={visible}
        onClose={() => {
          onClose();
          clean();
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={[styles.center, { flex: 2 }]}>
            <StyledText bigTitle>{thousandsSystem(value)}</StyledText>
            <TouchableOpacity
              onPress={() => setDescriptionModal(true)}
              style={{ opacity: !value ? 0.6 : 1 }}
              disabled={!value}
            >
              <StyledText color={colors.primary} smallSubtitle style={{ marginTop: 15 }}>
                Añadir nombre
              </StyledText>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 4 }}>
            <Pad
              buttonText="Enviar al carrito"
              value={value}
              onChange={(value: number) => setValue(value)}
              maxValue={9999999999}
              condition={value > 0}
              onSave={() => {
                onSave(send(), register);
                onClose();
                clean();
              }}
            />
          </View>
        </View>
      </ScreenModal>
      <ScreenModal
        title="Descripción"
        visible={descriptionModal}
        onClose={() => {
          setDescriptionModal(false);
          clean();
        }}
      >
        <Layout>
          <View style={[{ flexGrow: 1 }, styles.center]}>
            <View style={{ width: "100%" }}>
              <TextInput
                value={name}
                style={[
                  styles.inputDescription,
                  { color: colors.text, borderColor: colors.primary },
                ]}
                placeholderTextColor={colors.border}
                placeholder="Escriba el nombre"
                maxLength={30}
                onChangeText={setName}
              />
              <View style={[styles.row, styles.descriptionToggle]}>
                <StyledText>Registrar producto producto</StyledText>
                <Switch
                  value={register}
                  onValueChange={setRegister}
                  thumbColor={register ? colors.primary : colors.card}
                />
              </View>
            </View>
          </View>
          <StyledButton
            backgroundColor={colors.primary}
            style={{ marginTop: 10 }}
            disable={!name}
            onPress={() => {
              onSave(send({ name }), register);
              setDescriptionModal(false);
              onClose();
              clean();
            }}
          >
            <StyledText center color="#FFFFFF">
              Guardar
            </StyledText>
          </StyledButton>
        </Layout>
      </ScreenModal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  descriptionToggle: {
    paddingVertical: 10,
  },
  inputDescription: {
    marginVertical: 15,
    paddingVertical: 8,
    fontSize: 18,
    borderBottomWidth: 2,
  },
});

export default UnregisteredModal;
