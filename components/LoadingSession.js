import { View, Modal } from 'react-native'
import { useSelector } from 'react-redux';
import Donut from "@components/Donut";
import TextStyle from '@components/TextStyle';
import theme from '@theme';

const light = theme.colors.light;
const dark = theme.colors.dark;

const LoadingSession = ({ modalVisible, percentage }) => {
    const mode = useSelector(state => state.mode);

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor:
              mode === "light" ? `${light.main4}FF` : `${dark.main1}FF`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Donut color={light.main2} percentage={percentage} />
          <TextStyle
            bigParagraph
            color={mode === "dark" ? dark.textWhite : light.textDark}
            customStyle={{ marginTop: 15 }}
          >
            {percentage === 25
              ? "ESTABLECIENDO CONEXIÓN"
              : percentage === 50
                ? "VALIDANDO CORREO"
                : percentage === 100
                  ? "INICIANDO SESIÓN"
                  : ""}
          </TextStyle>
          <TextStyle smallParagraph color={light.main2}>
            POR FAVOR ESPERE
          </TextStyle>
        </View>
      </Modal>
  )
}

export default LoadingSession