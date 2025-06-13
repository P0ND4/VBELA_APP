import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import apiClient from "infrastructure/api/server";
import { change } from "application/slice/settings/initial.basis.slice";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import CountScreenModal from "presentation/components/modal/CountScreenModal";
import endpoints from "config/constants/api.endpoints";

const Statistic = () => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const initialBasis = useAppSelector((state) => state.initialBasis);

  const [initialBasisModal, setInitialBasisModal] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const onChange = async (initialBasis: number) => {
    dispatch(change(initialBasis));
    await apiClient({
      url: endpoints.setting.initialBasis(),
      method: "PATCH",
      data: { initialBasis },
    });
    emit("accessToStatistics");
  };

  return (
    <>
      <Layout>
        <StyledButton style={styles.row} onPress={() => setInitialBasisModal(true)}>
          <StyledText>
            Base inicial {!!initialBasis && `(${thousandsSystem(initialBasis)})`}
          </StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
      </Layout>
      <CountScreenModal
        title="Base inicial"
        increasers={false}
        description={() =>
          "Defina la cantidad de dinero que dispone la caja para entregar cambios o vueltos"
        }
        visible={initialBasisModal}
        defaultValue={initialBasis}
        isRemove={!!initialBasis}
        maxValue={9999999999}
        onClose={() => setInitialBasisModal(false)}
        onSave={onChange}
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

export default Statistic;
