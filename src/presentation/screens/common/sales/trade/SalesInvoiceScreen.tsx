import React, { useRef, useState } from "react";
import { StyleSheet, View, ScrollView, TextInput } from "react-native";
import { Order } from "domain/entities/data/common/order.entity";
import { useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { changeDate, formatDecimals, thousandsSystem } from "shared/utils";
import { generatePDF, printPDF } from "infrastructure/services/pdf.services";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import ScreenModal from "presentation/components/modal/ScreenModal";
import ViewShot from "react-native-view-shot";

import * as Sharing from "expo-sharing";
import { useInvoiceHtml } from "../hooks/useInvoiceHtml";

type Icons = keyof typeof Ionicons.glyphMap;

type EmailModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (email: string) => void;
};

const EmailModal: React.FC<EmailModalProps> = ({ visible, onClose, onSave }) => {
  const { colors } = useTheme();

  const [email, setEmail] = useState<string>("");

  return (
    <ScreenModal title="Descripción" visible={visible} onClose={onClose}>
      <Layout>
        <View style={[{ flexGrow: 1 }, styles.center]}>
          <View>
            <StyledText center>Correo electrónico</StyledText>
            <TextInput
              value={email}
              style={[styles.inputEmail, { borderColor: colors.primary, color: colors.text }]}
              keyboardType="email-address"
              placeholderTextColor={colors.border}
              placeholder="Digite el correo electrónico"
              maxLength={30}
              onChangeText={setEmail}
            />
          </View>
        </View>
        <StyledButton
          backgroundColor={colors.primary}
          style={{ marginTop: 10 }}
          disable={!email}
          onPress={() => {
            onSave(email);
            onClose();
          }}
        >
          <StyledText center color="#FFFFFF">
            Guardar
          </StyledText>
        </StyledButton>
      </Layout>
    </ScreenModal>
  );
};

const Division: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <View style={styles.row}>
    <StyledText>{left}</StyledText>
    <StyledText>{right}</StyledText>
  </View>
);

type ButtonProps = { icon: Icons; name: string; onPress: () => void };

const Button: React.FC<ButtonProps> = ({ icon, name, onPress }) => {
  const { colors } = useTheme();

  return (
    <StyledButton style={[styles.button, { borderColor: colors.border }]} onPress={onPress}>
      <Ionicons name={icon} size={30} color={colors.text} />
      <StyledText verySmall style={{ marginTop: 10 }}>
        {name}
      </StyledText>
    </StyledButton>
  );
};

const SalesInvoiceScreen: React.FC<{ trade: Order; goEdit: () => void }> = ({ trade, goEdit }) => {
  const information = useAppSelector((state) => state.invoiceInformation);

  const { colors } = useTheme();
  const { getHtml } = useInvoiceHtml();

  const [emailModal, setEmailModal] = useState<boolean>(false);

  const phoneNumber = `+${information.countryCode}${information.phoneNumber}`;
  const totalNoDiscount = trade.selection.reduce((a, b) => a + b.total, 0);

  const viewShotRef = useRef<ViewShot>(null);

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <StyledButton style={styles.center} onPress={goEdit}>
          <Ionicons
            name="create-outline"
            color={colors.text}
            size={30}
            style={{ marginRight: 10 }}
          />
          <StyledText smallParagraph center>
            Editar mi recibo
          </StyledText>
        </StyledButton>
        <View style={styles.container}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ViewShot
              ref={viewShotRef}
              options={{ result: "tmpfile", format: "png", quality: 1.0 }}
              style={[styles.invoice, { backgroundColor: colors.background }]}
            >
              {information.company && <StyledText center>{information.company}</StyledText>}
              {information.business && <StyledText center>{information.business}</StyledText>}
              {information.identification && (
                <StyledText center>{information.identification}</StyledText>
              )}
              {information.address && <StyledText center>{information.address}</StyledText>}
              {information.phoneNumber && <StyledText center>{phoneNumber}</StyledText>}
              {information.complement && <StyledText center>{information.complement}</StyledText>}
              <View style={{ width: "100%" }}>
                <View style={[styles.space, { borderColor: colors.border }]}>
                  <Division left="FACTURA #" right={trade.invoice} />
                  <Division left="FECHA" right={changeDate(new Date(trade.creationDate), true)} />
                </View>
                <View style={[styles.space, { borderColor: colors.border }]}>
                  <StyledText>SU NÚMERO DE ORDEN ES: {trade.order}</StyledText>
                </View>
                <View style={[styles.space, { borderColor: colors.border }]}>
                  {trade.selection.map((tr) => {
                    return (
                      <Division
                        key={tr.id}
                        left={`${tr.quantity}x ${tr.name}`}
                        right={`${!!tr.discount ? `(${formatDecimals(tr.discount * 100, 2)}%) (-${tr.value * tr.quantity * tr.discount})` : ""} ${!tr.total ? "GRATIS" : thousandsSystem(tr.total)}`}
                      />
                    );
                  })}
                  <StyledText>
                    Chq #{trade.order} Orden #{thousandsSystem(trade.selection.length)}
                  </StyledText>
                </View>
                {trade.observation && (
                  <View style={[styles.space, { borderColor: colors.border }]}>
                    <StyledText justify>
                      {trade.observation.slice(0, 200) +
                        (trade.observation.length > 200 ? "..." : "")}
                    </StyledText>
                  </View>
                )}
                <View style={{ paddingVertical: 15 }}>
                  {!!trade.discount && (
                    <Division
                      left={`DESCUENTO (${formatDecimals(trade.discount * 100, 2)}%)`}
                      right={thousandsSystem(totalNoDiscount * trade.discount)}
                    />
                  )}
                  <Division
                    left="TOTAL:"
                    right={!trade.total ? "GRATIS" : thousandsSystem(trade.total)}
                  />
                </View>
              </View>
            </ViewShot>
          </ScrollView>
        </View>
        <View style={styles.row}>
          <Button
            icon="document-text-outline"
            name="PDF"
            onPress={() => generatePDF({ html: getHtml(trade) })}
          />
          {/* <Button
            icon="mail-outline"
            name="Email"
            onPress={() => {
              alert("Para la cuarta actualización");
              // setEmailModal(true);
            }}
          /> */}
          <Button
            icon="print-outline"
            name="Imprimir"
            onPress={() => printPDF({ html: getHtml(trade) })}
          />
          <Button
            icon="share-social-outline"
            name="Compartir"
            onPress={async () => {
              if (viewShotRef.current && viewShotRef.current.capture) {
                const imageURI = await viewShotRef.current.capture();
                await Sharing.shareAsync(imageURI);
              }
            }}
          />
        </View>
      </Layout>
      <EmailModal visible={emailModal} onClose={() => setEmailModal(false)} onSave={() => {}} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  space: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  button: {
    width: "auto",
    alignItems: "center",
    borderLeftWidth: 1,
    marginVertical: 0,
    paddingVertical: 15,
    borderRadius: 0,
    flexGrow: 1,
    flexBasis: 0,
    elevation: 0,
  },
  center: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    marginVertical: 0,
  },
  container: { flexGrow: 1 },
  invoice: {
    padding: 20,
    width: "100%",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputEmail: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    borderBottomWidth: 2,
    textAlign: "center",
    width: 300,
  },
});

export default SalesInvoiceScreen;
