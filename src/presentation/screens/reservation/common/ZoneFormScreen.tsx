import React, { useEffect, useState } from "react";
import { View, KeyboardAvoidingView, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import StyledButton from "presentation/components/button/StyledButton";
import StyledInput from "presentation/components/input/StyledInput";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";

const ZoneFormScreen = () => {
  const { colors } = useTheme();
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    register("name", { value: "", required: true });
    register("description", { value: "" });
    register("location", { value: "" });
  }, []);

  return (
    <Layout style={{ padding: 30 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View>
              <StyledText bigTitle center color={colors.primary}>
                VBELA
              </StyledText>
              <StyledText bigParagraph center>
                Creación de zona
              </StyledText>
            </View>
            <View style={{ marginVertical: 30 }}>
              <StyledInput
                value={name}
                right={
                  name ? () => <StyledText color={colors.primary}>Nombre</StyledText> : undefined
                }
                placeholder="Nombre"
                maxLength={20}
                onChangeText={(text: string) => {
                  setValue("name", text);
                  setName(text);
                }}
              />
              {errors.name?.type && (
                <StyledText verySmall color={colors.primary}>
                  El nombre es obligatorio
                </StyledText>
              )}
              <StyledInput
                value={description}
                right={
                  description
                    ? () => <StyledText color={colors.primary}>Descripción</StyledText>
                    : undefined
                }
                placeholder="Descripción"
                maxLength={100}
                onChangeText={(text: string) => {
                  setValue("description", text);
                  setDescription(text);
                }}
              />
              <StyledInput
                value={location}
                right={
                  location
                    ? () => <StyledText color={colors.primary}>Ubicación</StyledText>
                    : undefined
                }
                placeholder="Ubicación"
                maxLength={50}
                onChangeText={(text: string) => {
                  setValue("location", text);
                  setLocation(text);
                }}
              />
            </View>
            <StyledButton
              onPress={handleSubmit((data) => setLoading(true))}
              backgroundColor={colors.primary}
              disable={loading}
            >
              <StyledText center>Crear</StyledText>
            </StyledButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default ZoneFormScreen;
