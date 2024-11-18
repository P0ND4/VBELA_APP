import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import Layout from "@components/Layout";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import { change } from "@features/tables/invoiceInformationSlice";

const { light } = theme();

const EditInvoice = ({ navigation }) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const invoiceInformation = useSelector((state) => state.invoiceInformation);

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [address, setAddress] = useState("");
  const [complement, setComplement] = useState("");

  const dispatch = useDispatch();

  const save = (data) => {
    dispatch(change(data));
    navigation.pop();
  };

  useEffect(() => {
    register("name", { value: invoiceInformation?.name || "", required: true });
    register("number", { value: invoiceInformation?.number || "" });
    register("address", { value: invoiceInformation?.address || "" });
    register("complement", { value: invoiceInformation?.complement || "" });

    setName(invoiceInformation?.name || "");
    setNumber(invoiceInformation?.number || "");
    setAddress(invoiceInformation?.address || "");
    setComplement(invoiceInformation?.complement || "");
  }, []);

  return (
    <Layout style={{ justifyContent: "space-between" }}>
      <View>
        <InputStyle
          placeholder="Nombre del comercio"
          value={name}
          maxLength={20}
          onChangeText={(text) => {
            setName(text);
            setValue("name", text);
          }}
        />
        {errors.name?.type && (
          <TextStyle smallParagraph color={light.main2}>
            El nombre es requerido
          </TextStyle>
        )}
        <InputStyle
          placeholder="Teléfono (opcional)"
          value={number}
          maxLength={14}
          keyboardType="phone-pad"
          onChangeText={(num) => {
            setNumber(num);
            setValue("number", num);
          }}
        />
        <InputStyle
          placeholder="Dirección (opcional)"
          maxLength={40}
          value={address}
          onChangeText={(text) => {
            setAddress(text);
            setValue("address", text);
          }}
        />
        <InputStyle
          placeholder="Complemento (opcional)"
          maxLength={40}
          value={complement}
          onChangeText={(text) => {
            setComplement(text);
            setValue("complement", text);
          }}
        />
      </View>
      <ButtonStyle backgroundColor={light.main2} onPress={handleSubmit(save)}>
        <TextStyle center>Guardar</TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

export default EditInvoice;
