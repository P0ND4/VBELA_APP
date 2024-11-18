import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "@react-navigation/native";
// import { CreateSaleContext } from "application/context/sales/CreateContext";
import { Controller, useForm } from "react-hook-form";
import { random, thousandsSystem } from "shared/utils";
import { Element } from "domain/entities/data/common/element.entity";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import SalesCard from "presentation/screens/common/sales/components/SalesCard";
import FloorModal from "presentation/components/modal/FloorModal";
import InputScreenModal from "presentation/components/modal/InputScreenModal";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
};

const UnitModal: React.FC<ModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  const array = new Array(3);

  return (
    <FloorModal visible={visible} onClose={onClose} title="Vender por" style={{ maxHeight: 500 }}>
      <TouchableOpacity style={[styles.row, styles.uniModalEdit]}>
        <Ionicons name="create-outline" color={colors.primary} size={25} />
        <StyledText style={{ marginLeft: 5 }}>Editar las unidades</StyledText>
      </TouchableOpacity>
      <FlatList
        data={array}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <>
            <TouchableOpacity style={[{ paddingVertical: 14 }, styles.row]} onPress={() => {}}>
              <StyledText>Ok</StyledText>
            </TouchableOpacity>
            <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
          </>
        )}
      />
    </FloorModal>
  );
};

type ElementFormProps = {
  defaultValue?: Element;
  locationID: string;
  onSubmit: (data: Element) => void;
};

const ElementForm: React.FC<ElementFormProps> = ({ onSubmit, defaultValue, locationID }) => {
  const { control, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: {
      id: defaultValue?.id || random(10),
      locationID: defaultValue?.locationID || locationID,
      name: defaultValue?.name || "",
      price: defaultValue?.price || 0,
      cost: defaultValue?.cost || 0,
      promotion: defaultValue?.promotion || 0,
      category: defaultValue?.category || [],
      subcategory: defaultValue?.subcategory || [],
      description: defaultValue?.description || "",
      code: defaultValue?.code || "",
      unit: defaultValue?.unit || "",
      highlight: defaultValue?.highlight || false,
      stock: defaultValue?.stock || 0,
      minStock: defaultValue?.minStock || 0,
      affiliatedStockID: defaultValue?.affiliatedStockID || "",
      creationDate: defaultValue?.creationDate || new Date().toISOString(),
      modificationDate: new Date().toISOString(),
    },
  });

  const { colors } = useTheme();
  // const something = useContext(CreateSaleContext);

  const [optional, setOptional] = useState<boolean>(false);
  const [descriptionModal, setDescriptionModal] = useState<boolean>(false);
  const [unitModal, setUnitModal] = useState<boolean>(false);

  const { description } = watch();

  return (
    <>
      <Layout style={{ justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <SalesCard
            data={watch()}
            onPress={() => alert("Para la cuarta actualización la agregación de imagenes")}
          />
          <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View>
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
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <StyledInput
                      placeholder="Precio de venta"
                      keyboardType="numeric"
                      maxLength={13}
                      onChangeText={(num) => {
                        if (num === "") return onChange("");
                        const numeric = num.replace(/[^0-9]/g, "");
                        onChange(numeric ? parseFloat(numeric) : "");
                      }}
                      onBlur={onBlur}
                      value={thousandsSystem(value || "")}
                    />
                  )}
                />
                {formState.errors.price && (
                  <StyledText color={colors.primary} verySmall>
                    El precio de venta es requerido
                  </StyledText>
                )}
                <StyledButton style={styles.row} onPress={() => setOptional(!optional)}>
                  <StyledText>Opcionales</StyledText>
                  <Ionicons name={optional ? "caret-up" : "caret-down"} />
                </StyledButton>
                {optional && (
                  <>
                    <Controller
                      name="cost"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          placeholder="Costo de producción"
                          keyboardType="numeric"
                          maxLength={13}
                          onChangeText={(num) => {
                            if (num === "") return onChange("");
                            const numeric = num.replace(/[^0-9]/g, "");
                            onChange(numeric ? parseFloat(numeric) : "");
                          }}
                          onBlur={onBlur}
                          value={thousandsSystem(value || "")}
                        />
                      )}
                    />
                    <Controller
                      name="promotion"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          placeholder="Precio de promoción"
                          keyboardType="numeric"
                          maxLength={13}
                          onChangeText={(num) => {
                            if (num === "") return onChange("");
                            const numeric = num.replace(/[^0-9]/g, "");
                            onChange(numeric ? parseFloat(numeric) : "");
                          }}
                          onBlur={onBlur}
                          value={thousandsSystem(value || "")}
                        />
                      )}
                    />
                    <StyledButton
                      style={styles.row}
                      onPress={() => alert("Para la tercera actualización")}
                    >
                      <StyledText>Categoría</StyledText>
                      <Ionicons name="chevron-forward" color={colors.text} size={19} />
                    </StyledButton>
                    <StyledButton
                      style={styles.row}
                      onPress={() => alert("Para la tercera actualización")}
                    >
                      <StyledText>Sub - Categoría</StyledText>
                      <Ionicons name="chevron-forward" color={colors.text} size={19} />
                    </StyledButton>
                    <StyledButton style={styles.row} onPress={() => setDescriptionModal(true)}>
                      <StyledText>
                        {description
                          ? `Descripción agregada (${thousandsSystem(description.length)} letras)`
                          : "Descripción"}
                      </StyledText>
                      <Ionicons name="chevron-forward" color={colors.text} size={19} />
                    </StyledButton>
                    <Controller
                      name="code"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <StyledInput
                          placeholder="Código"
                          maxLength={12}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                        />
                      )}
                    />
                    <StyledButton style={styles.row} onPress={() => setUnitModal(true)}>
                      <StyledText>Vender por</StyledText>
                      <Ionicons name="chevron-forward" color={colors.text} size={19} />
                    </StyledButton>
                    <Controller
                      name="highlight"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <View style={[styles.row, { marginTop: 12 }]}>
                          <StyledText>Destacar producto</StyledText>
                          <Switch
                            value={value}
                            onValueChange={onChange}
                            thumbColor={value ? colors.primary : colors.card}
                          />
                        </View>
                      )}
                    />
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          style={{ marginTop: 20 }}
          onPress={handleSubmit(onSubmit)}
        >
          <StyledText center color="#FFFFFF">
            {defaultValue ? "Guardar" : "Añadir"} producto
          </StyledText>
        </StyledButton>
      </Layout>
      <InputScreenModal
        visible={descriptionModal}
        onClose={() => setDescriptionModal(false)}
        title="Descripción"
        placeholder="Escribe tu descripción"
        onSubmit={(value) => setValue("description", value)}
      />
      <UnitModal visible={unitModal} onClose={() => setUnitModal(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  descriptionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  uniModalEdit: {
    justifyContent: "center",
    paddingVertical: 12,
  },
});

export default ElementForm;
